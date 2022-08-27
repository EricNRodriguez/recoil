# Overview

The context package provides utility hooks that make writing and maintaining complex applications less challenging. 

The api provides two core DX improvements:
1. High level declarative hooks that abstract away the low level methods provided by the `dom` package
   1. `onMount`
   2. `onUnmount`
   3. `onInitialMount`
   4. `runMountedEffect`
   5. `defer`: An exposed implementation detail enabling custom application-specific hooks to be built.
2. A type-safe (tracked) dependency injection API, analogous to that provided by the vue composition API.
   1. `inject`
   2. `provide`

In order to make a component `contextual`, wrap it with `withContext`. 

> WARNING: In order for DI to work with lazily constructed/reconstructed DOM trees, the callback needs to close over the DI scope at the current time, and hence, is required to be wrapped with a `captureContextState` call. 
