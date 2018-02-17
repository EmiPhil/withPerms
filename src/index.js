import React, { Component } from 'react'

// lodash functions will be auto cherry picked by babel
import _ from 'lodash'

// ()() convention for usage with functions like compose
// https://reactjs.org/docs/higher-order-components.html#convention-maximizing-composability
const withPerms = (perms = [], register) => (WrappedComponent) => {
  // The register can be an actual function or a string.
  // If it is a string, we will assume the function is in props,
  // which allows users to pass through redux action functions via
  // mapDispatchToProps
  const hasRegister = _.isFunction(register) || _.isString(register)

  class WithPerms extends Component {
    constructor (props) {
      super(props)
      this.registerPermission = this.registerPermission.bind(this)

      if (hasRegister) {
        // If the register argument is a string, grab the func from props
        _.isString(register)
          ? this.register = this.props[register]
          : this.register = register

        // Because the function may not be in props when register is a string,
        // throw an error to help debug
        if (!_.isFunction(this.register)) {
          throw new Error(`WithPerms: this.props[${register}] is not a function.`)
        }
      } else {
        // Set initial state
        this.state = { perms: {} }
      }
    }

    componentDidMount () {
      // Run each of the initial permissions, passed through the perms argument, through either the register function or into state
      _.each(perms, this.registerPermission)
    }

    registerPermission (perm) {
      // if the perm is a string, convert it to an object with signature
      // { [name]: name }
      // otherwise, pass the perm directly (does not guarantee the format)
      perm = _.isString(perm) ? { [perm]: perm } : perm
      return hasRegister
        // if there is a register function, call it. Otherwise update state
        ? this.register(perm)
        : this.setState({ perms: _.assign({}, this.state.perms, perm) })
    }

    render () {
      // always pass props through with registerPermission included
      const registerPermission = this.registerPermission
      const props = { registerPermission, ...this.props }

      return hasRegister
        // if there is no register function, pass the perms state down
        ? <WrappedComponent {...props} />
        : <WrappedComponent perms={this.state.perms} {...props} />
    }
  }

  // recommended HOC practice
  // https://reactjs.org/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging
  const getDisplayName = (WrappedComponent) => {
    return WrappedComponent.displayName || WrappedComponent.name
  }
  WithPerms.displayName = `WithPerms(${getDisplayName(WrappedComponent)})`

  return WithPerms
}

// defualt, so either:
// const withPerms = require('with-perms')
// or
// import withPerms from 'with-perms'
export default withPerms
