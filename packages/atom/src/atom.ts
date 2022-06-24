// we have 3 core types 
// 1: a value
// 2: a derivation 
// 3: a side effect

// values are represented 


public interface Atom<T> {
	public T get();
}

interface Producer<T> {
	(): T;
}




public interface AtomFactory {
	public Atom<T> create(T value);
	public Atom<T> derive<T>(getValue: Producer<T>);
}


public class AtomFactoryImpl {
	
}

private class LeafAtom<T> implements Atom<T> {

}

private class DerivedAtom<T> implements Atom<T> {

}






