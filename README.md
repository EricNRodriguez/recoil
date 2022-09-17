# Overview

Recoil is a prototype lightweight UI library that requires no compilation and has a heavy focus on fine grained reactivity. 

The provided packages are all opt-in, allowing as little or as much of the library to be used.

The features that you would expect of any modern web UI library are provided, including:
- performant dom reconciliation
- code splitting (via suspense components)
- reactive primitives for state management
- a high level declerative dom dsl
- jsx support (a lighweight pragma that wraps the dsl)
- event delegation (with support for shadow doms)
- declarative components, providing lifecycle methods, a typesafe DI, custom hooks and more.

# Packages
- `dom`: low level dom wrappers/utils/reconciliation
- `dom-dsl`: a vanilla js dom dsl
- `dom-jsx`: jsx bindings 
- `atom`: performant reactive primitives 
- `component`: DI, declarative lifecycle methods, custom scoping hooks etc

# Warning 

This library is not intended for production use, or any serious use for that matter. Whilst it should hold up in those settings, no guarantee for timely support is be given in the instance of bugs/issues. Development has been done with modern js features that are not supported on older browsers.