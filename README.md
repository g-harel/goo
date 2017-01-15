<p align="center">
    <img src="https://i.gyazo.com/0c6379061a007de589d30eebec795c19.png" width="600"/>
</p>

GOO.js is a small framework made to quickly jumpstart projects by solving common web application challenges. A goo object handles state and the DOM representation of that state. By default it also adds actions to undo and redo state changes. Internally, goo has three components: a state reducer that does not mutate state, a wrapper for the state reducer to store the state and a DOM handler that uses virtual DOM.

Live version of the to-do list example project [here](https://g-harel.github.io/GOO/)

Creating a goo object is done like this:

```javascript
var app = goo(controllers, args[, options]);
```

This goo object can now be used to update an application using it's `.act` function:

```javascript
app.act(action_type, params);
```

Calling this act function will update the state of the app and goo will attempt to update the DOM with the smallest possible number of actions using virtual DOM diffing.

# `controllers`

The `controllers` argument specifies the containers for each distinct component of the app as well as the builder function associated with it. This variable can take the form of an object or can be an array of objects if there are more than one.

```javascript
// single controller
var controllers = {
    target: // ...
    builder: // ...
}

// multiple controllers
var controllers = [
    {
        target: // ...
        builder: // ...
    },
    {
        target: // ...
        builder: // ...
    }
]
```

Using an array of controllers allows actions and state to be shared between multiple DOM components of an application without requiring the whole app to be rendered by one large builder.

### `target`

A DOM node that will serve as the root of the application component.

### `builder`

A function that takes in state as an argument and returns a virtual DOM (vdom) representation of that state. The implementation details of this function is not handled by the goo object and the only condition is that the output must be a valid vdom object.

```javascript
function builder(state) {
    // ...
    return {
        // vdom object ...
    };
}
```

A generic vdom object takes this form:

```javascript
var vdom_obj = {
    tagName: 'div'
    attributes: {
        className: 'wrapper',
        // ...
    }
    style: {
        background-color: '#333',
        // ...
    }
    children: // ...
}
```

In the case of a textNode, the `tagName` property is replaced by a `text` property.

```javascript
var vdom_obj = {
    text: // ...
    attributes: // ...
    style: //...
}
```

All properties of a vdom_obj except the `tagName` or `text` are optional.

The `children` property can be either a key/value object or an array. When it is defined as an object, goo's vdom diffing will be able to compare children to their actual ancestor in the previous state instead of the one at the same array index. This can potentially have serious performance implications since, for example, it will prevent unnecessary re-renders of all the elements in a list if the first item is removed. However, because of the un-ordered nature of an object's keys, this feature should only be used when their order is not important.

Events listeners (like `onclick`) can be added to the attributes object.

# `args`

The second argument of the goo function is `args`:

```javascript
var args = {
    state
    actions
    middleware
    watchers
}
```

### `state`

The initial state of the app on which actions can be performed.

### `actions`

The definition of all actions that the goo object can do on the state.

The `actions` object can be either an array of objects that define actions or a single object containing all the actions.

```javascript
var actions = [
    {
        ADD_USER: //...
        REMOVE_USER: //...
    },
    {
        ADD_USER: //...
    }
]
```

or

```javascript
var actions = {
    ADD_USER: //...
    REMOVE_USER: //...
}
```

This allows for the separation of actions into logical groups that can then be joined into an array at the time of the creation of the goo object.

Actions in an array are executed in ascending order (An action in the `actions` object at index 0 will be called before the one at index 1).

An `action` itself can also take many forms.

The simplest way to define an action is with a single function.

```javascript
ADD_USER: function(state, params) {
    // ...
    return state;
}
```

This function can be replaced by an object to allow restriction of the scope of that action.

```javascript
ADD_USER: {
    target: ['path', 'to', 'scope'],
    do: function(scoped_state, params) {
        // ...
        return scoped_state;
    }
}
```

Both of these notations can be used within arrays if there is a need to call multiple functions for a single action.

```javascript
ADD_USER: [
    function(state, params) {
        // ...
        return state;
    },{
        target: ['path', 'to', 'scope'],
        do: function(scoped_state, params) {
            // ...
            return scoped_state;
        }
    }
]
```

This array is also executed in ascending order.

The params argument given to actions is the one given to the goo object's act function.

```javascript
app.act('ADD_USER', {
    name: 'John',
    age: '42',
    country: 'Canada'
})
```

### `middleware`

A single function or an array of functions that are given control of an action before it is done on the state.

In the case of an array of functions, each middleware function is nested within the previous one to allow async operations.

A middleware function takes the form:

```javascript
function middleware(callback, state, action_type, params) {
    // ...
    var next_state = callback(state, action_type, params);
    // ...
    return next_state;
}
```

This syntax allows middleware to read, edit, cancel or perform async operations for any action.

Middleware functions in an array are nested so that index 0 encompases index 1.

### `watchers`

A single function or an array of functions that are called in ascending order after an action has been done on the state.

A watcher function takes the form:

```javascript
function watcher(state, action_type, params) {
    // ...
}
```

The state argument given to the watcher functions is a deep copy of the current state and therefore watchers cannot modify state without issuing another action.

# `undo/redo`

Unless disabled in the options, a goo object will handle `UNDO` and `REDO` actions artificially through middleware.

# `options`

`history_compat`: use regular state history _(in development)_

`history_length`: length of the undo history

`state_log`: action type, params and before/after state in console for each action

`disable_history`: disables history state history storage