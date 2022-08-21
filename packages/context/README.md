# Overview

The context package provides utility hooks that make writing and maintaining complex applications less challenging. 

The api provides two core DX improvements:
1. High level declarative hooks that abstract away the low level methods provided by the `dom` package
   1. `onMount`
   2. `onUnmount`
   3. `onInitialMount`
   4. `runMountedEffect`
2. A type-safe (tracked) dependency injection API, analogous to that provided by the vue composition API.
   1. `inject`
   2. `provide`

