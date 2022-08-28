"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SideEffect = exports.DerivedAtom = exports.VirtualDerivedAtom = exports.LeafAtomImpl = exports.isAtom = void 0;
const typescript_monads_1 = require("typescript-monads");
const error_1 = require("./error");
const weak_collection_1 = require("./weak_collection");
const isAtom = (obj) => {
    return (obj instanceof Object &&
        "get" in obj &&
        "getUntracked" in obj &&
        "invalidate" in obj &&
        "map" in obj);
};
exports.isAtom = isAtom;
class BaseAtom {
    constructor(context) {
        this.parents = new weak_collection_1.WeakCollection();
        this.context = context;
    }
    getParents() {
        return this.parents.getItems();
    }
    forgetParents() {
        this.parents.reset();
    }
    invalidate() {
        this.parents.forEach((parent) => {
            parent.childDirty();
            parent.childReady();
        });
    }
    getContext() {
        return this.context;
    }
    latchToCurrentDerivation() {
        this.getContext()
            .getCurrentParent()
            .tapSome(this.parents.register.bind(this.parents));
    }
    map(mutation) {
        return new VirtualDerivedAtom(this.context, () => mutation(this.get()));
    }
}
class LeafAtomImpl extends BaseAtom {
    constructor(value, context) {
        super(context);
        this.value = value;
    }
    get() {
        this.latchToCurrentDerivation();
        return this.getUntracked();
    }
    getUntracked() {
        return this.value;
    }
    set(value) {
        this.checkSetIsNotASideEffect();
        if (value === this.value) {
            return;
        }
        this.value = value;
        // intentionally kicking AFTER setting, since
        // we want our effects to run with the new values
        this.dirty();
    }
    update(fn) {
        this.set(fn(this.getUntracked()));
    }
    dirty() {
        const prevParents = this.getParents();
        this.forgetParents();
        prevParents.forEach((parent) => {
            parent.childDirty();
            parent.childReady();
        });
    }
    checkSetIsNotASideEffect() {
        if (this.getContext().getCurrentParent().isSome()) {
            throw new error_1.StatefulSideEffectError("stateful set called on leaf atom during derivation");
        }
    }
}
exports.LeafAtomImpl = LeafAtomImpl;
/**
 * A derivation that is logically a node in the DAG, but is actually just a virtual node - the runtime graph
 * has no knowledge of it.
 */
class VirtualDerivedAtom {
    constructor(context, derivation) {
        this.context = context;
        this.derivation = derivation;
        this.tracker = new LeafAtomImpl(false, context);
    }
    get() {
        this.tracker.get();
        return this.derivation();
    }
    getUntracked() {
        this.context.enterNewTrackingContext();
        try {
            return this.get();
        }
        finally {
            this.context.exitCurrentTrackingContext();
        }
    }
    invalidate() {
        this.tracker.invalidate();
    }
    map(transform) {
        return new VirtualDerivedAtom(this.context, () => transform(this.get()));
    }
}
exports.VirtualDerivedAtom = VirtualDerivedAtom;
class DerivedAtom extends BaseAtom {
    constructor(deriveValue, context) {
        super(context);
        this.value = typescript_monads_1.Maybe.none();
        this.numChildrenNotReady = 0;
        this.deriveValue = deriveValue;
    }
    get() {
        this.latchToCurrentDerivation();
        return this.executeScopedDerivation();
    }
    executeScopedDerivation() {
        try {
            this.getContext().pushParent(this);
            return this.deriveValue();
        }
        finally {
            this.getContext().popParent();
        }
    }
    getUntracked() {
        this.getContext().enterNewTrackingContext();
        try {
            return this.deriveValue();
        }
        finally {
            this.getContext().exitCurrentTrackingContext();
        }
    }
    childReady() {
        this.numChildrenNotReady--;
        if (this.numChildrenNotReady === 0) {
            const prevParents = this.getParents();
            this.forgetParents();
            prevParents.forEach((parent) => {
                parent.childReady();
            });
        }
    }
    childDirty() {
        this.discardCachedValue();
        if (this.numChildrenNotReady === 0) {
            this.getParents().forEach((parent) => {
                parent.childDirty();
            });
        }
        this.numChildrenNotReady++;
    }
    discardCachedValue() {
        this.value = typescript_monads_1.Maybe.none();
    }
}
exports.DerivedAtom = DerivedAtom;
var SideEffectStatus;
(function (SideEffectStatus) {
    SideEffectStatus["ACTIVE"] = "active";
    SideEffectStatus["INACTIVE"] = "inactive";
})(SideEffectStatus || (SideEffectStatus = {}));
class SideEffect {
    constructor(effect, context, effectScheduler) {
        this.numChildrenNotReady = 0;
        this.state = { status: SideEffectStatus.ACTIVE };
        this.runScoped = () => {
            try {
                this.context.pushParent(this);
                this.effect();
            }
            finally {
                this.context.popParent();
            }
        };
        this.effect = effect;
        this.context = context;
        this.effectScheduler = effectScheduler;
    }
    run() {
        this.effectScheduler.schedule(this.runScoped);
    }
    childReady() {
        this.numChildrenNotReady--;
        if (this.numChildrenNotReady === 0) {
            switch (this.state.status) {
                case SideEffectStatus.ACTIVE:
                    this.run();
                    return;
                case SideEffectStatus.INACTIVE:
                    this.state.dirty = true;
                    return;
                default:
                    throw new Error("invalid state");
            }
        }
    }
    childDirty() {
        this.numChildrenNotReady++;
    }
    activate() {
        if (this.state.status === SideEffectStatus.ACTIVE) {
            return;
        }
        if (this.state.dirty) {
            this.run();
        }
        this.state = { status: SideEffectStatus.ACTIVE };
    }
    deactivate() {
        this.state = { status: SideEffectStatus.INACTIVE, dirty: false };
    }
}
exports.SideEffect = SideEffect;
