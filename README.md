# Polylit

An experiment to use Polymer based mixins with Lit.

## Setup

```sh
npm install
```

## Run tests

```sh
npm test
```

## Features

The following features are included:

- `ready()` method: called on `firstUpdated()`.
- `readOnly` flag to define [read-only properties](https://polymer-library.polymer-project.org/3.0/docs/devguide/properties#read-only).
- `observer` flag to declare [simple observers](https://polymer-library.polymer-project.org/3.0/docs/devguide/observers#simple-observers).
- `notify` flag to fire [property notification events](https://polymer-library.polymer-project.org/3.0/docs/devguide/properties#notify).
- `reflectToAttribute` flag to [handle attributes](https://polymer-library.polymer-project.org/3.0/docs/devguide/properties#attribute-reflection).
