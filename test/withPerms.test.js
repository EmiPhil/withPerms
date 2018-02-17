import test from 'ava'
import React from 'react'
import { shallow, mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import withPerms from '../src'

configure({ adapter: new Adapter() })

const wrappee = () => (<div>hi</div>)

test('Should return a function', t => {
  const func = withPerms()
  t.is(typeof func, 'function')
})

test('Should wrap the component', t => {
  const Wrapped = withPerms()(wrappee)
  const shallowRender = shallow(<Wrapped />).dive()
  t.is(shallowRender.contains(<div>hi</div>), true)
})

test('Should wrap the display name', t => {
  t.plan(2)

  class Comp extends React.Component {
    render () { return null }
  }
  Comp.displayName = 'Display'

  let displayName = withPerms()(Comp).displayName
  t.is(displayName, 'WithPerms(Display)')

  delete Comp.displayName
  displayName = withPerms()(Comp).displayName
  t.is(displayName, 'WithPerms(Comp)')
})

test('Should provide a registerPermission function to child props', t => {
  const Wrapped = withPerms()(wrappee)
  const shallowRender = shallow(<Wrapped />)

  t.is(typeof shallowRender.prop('registerPermission'), 'function')
})

// *****************************************************************************
// With no register function
// *****************************************************************************

test('Should assign perms to child props', t => {
  const perms = ['test']
  const expectedPerms = { 'test': 'test' }

  const Wrapped = withPerms(perms)(wrappee)
  const shallowRender = shallow(<Wrapped />)

  t.deepEqual(shallowRender.props().perms, expectedPerms)
})

test('Should maintain perm object structure in child props', t => {
  const perms = [{ permA: 'test' }]
  const expectedPerms = perms[0]

  const Wrapped = withPerms(perms)(wrappee)
  const shallowRender = shallow(<Wrapped />)

  t.deepEqual(shallowRender.props().perms, expectedPerms)
})

test('registerPermission function should add the permission to child props', t => {
  class Complex extends React.Component {
    componentDidMount () {
      this.props.registerPermission('new')
    }

    render () { return null }
  }

  const expectedPerms = { 'new': 'new' }

  const Wrapped = withPerms()(Complex)
  const component = mount(<Wrapped />).childAt(0)

  t.deepEqual(component.props().perms, expectedPerms)
})

test('registerPermission function should maintain object structure', t => {
  class Complex extends React.Component {
    componentDidMount () {
      this.props.registerPermission({ permA: 'new' })
    }

    render () { return null }
  }

  const expectedPerms = { permA: 'new' }

  const Wrapped = withPerms()(Complex)
  const component = mount(<Wrapped />).childAt(0)

  t.deepEqual(component.props().perms, expectedPerms)
})

// *****************************************************************************
// With register function
// *****************************************************************************

const register = (store) => (newPerm) => {
  store.perms = { ...store.perms, ...newPerm }
}

test('register mock works', t => {
  const store = {}
  register(store)({ test: 'works' })
  t.is(store.perms.test, 'works')
})

test('Should assign perms to store', t => {
  const perms = ['test']
  const expectedPerms = { 'test': 'test' }
  const store = {}

  const Wrapped = withPerms(perms, register(store))(wrappee)
  shallow(<Wrapped />)

  t.deepEqual(store.perms, expectedPerms)
})

test('Should maintain perm object structure in store', t => {
  const perms = [{ permA: 'test' }]
  const expectedPerms = perms[0]
  const store = {}

  const Wrapped = withPerms(perms, register(store))(wrappee)
  shallow(<Wrapped />)

  t.deepEqual(store.perms, expectedPerms)
})

test('registerPermission function should add the permission to the store', t => {
  class Complex extends React.Component {
    componentDidMount () {
      this.props.registerPermission('new')
    }

    render () { return null }
  }

  const expectedPerms = { 'new': 'new' }
  const store = {}

  const Wrapped = withPerms(undefined, register(store))(Complex)
  mount(<Wrapped />)

  t.deepEqual(store.perms, expectedPerms)
})

test('registerPermission function should maintain object structure', t => {
  class Complex extends React.Component {
    componentDidMount () {
      this.props.registerPermission({ permA: 'new' })
    }

    render () { return null }
  }

  const expectedPerms = { permA: 'new' }
  const store = {}

  const Wrapped = withPerms(undefined, register(store))(Complex)
  mount(<Wrapped />)

  t.deepEqual(store.perms, expectedPerms)
})

// *****************************************************************************
// With register string
// *****************************************************************************

test('Should assign perms to store', t => {
  const perms = ['test']
  const expectedPerms = { 'test': 'test' }
  const store = {}

  const Wrapped = withPerms(perms, 'register')(wrappee)
  shallow(<Wrapped register={register(store)} />)

  t.deepEqual(store.perms, expectedPerms)
})

test('Should maintain perm object structure in store', t => {
  const perms = [{ permA: 'test' }]
  const expectedPerms = perms[0]
  const store = {}

  const Wrapped = withPerms(perms, 'register')(wrappee)
  shallow(<Wrapped register={register(store)} />)

  t.deepEqual(store.perms, expectedPerms)
})

test('registerPermission function should add the permission to the store', t => {
  class Complex extends React.Component {
    componentDidMount () {
      this.props.registerPermission('new')
    }

    render () { return null }
  }

  const expectedPerms = { 'new': 'new' }
  const store = {}

  const Wrapped = withPerms(undefined, 'register')(Complex)
  mount(<Wrapped register={register(store)} />)

  t.deepEqual(store.perms, expectedPerms)
})

test('registerPermission function should maintain object structure', t => {
  class Complex extends React.Component {
    componentDidMount () {
      this.props.registerPermission({ permA: 'new' })
    }

    render () { return null }
  }

  const expectedPerms = { permA: 'new' }
  const store = {}

  const Wrapped = withPerms(undefined, 'register')(Complex)
  mount(<Wrapped register={register(store)} />)

  t.deepEqual(store.perms, expectedPerms)
})

test('should throw if trying to use a non existant prop', t => {
  const perms = ['test']
  const Wrapped = withPerms(perms, 'register')(wrappee)
  try {
    shallow(<Wrapped />)
  } catch (err) {
    t.is(err.message, 'WithPerms: this.props[register] is not a function.')
  }
})
