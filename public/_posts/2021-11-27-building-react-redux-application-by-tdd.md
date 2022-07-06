---
layout: post
title:  Building React-Redux application by TDD
date:   2021-11-26 21:00:00 +0100
tags: Building React-Redux application by TDD
author: Kunal Hire
permalink: /blog/:title.html
category: expertise
image: /assets/images/blog-react.jpeg
breadcrumb:
- name: Home
  url: /en/
- name: Blog Posts
  url: /blog/

lang: en
---


JavaScript frameworks have gained so much popularity during past few years. I remember my initial coding days when I used to be a server side developer and working on UI was not my cup of tea. I must say, the rise of frameworks like AngularJS raised my interest in front-end development.

AngularJS is full-fledged MV* framework, so testing the code or rather TDDing Angular application becomes easy with integrated support of testing libraries like Jasmine and and runner like Karma. However, React is not a framework, its a library. It gives us the flexibility of use but at the same time TDDing React application becomes tricky and introduction of Redux adds more complexity to it.

Today we are going to build the React-Redux application by TDD. For this case study, we will build simple Leave Management System dashboard. I already have built the leave form. It stores the record in the database whenever it is submitted. The code can be found here. Here we are going to build the dashboard which will show the list of leaves I have applied.

Story #1 — As an employee, I should be able to view all the leaves that I have applied so that I can plan my work and vacations.

## Approach

We will build the application using Facebook’s create-react-app. Following elements are involved in the typical React-Redux application. We will build them using TDD.

Components
Containers
Reducers
Actions

Create-react-app gives us the basic component but with no packaging structure. We will modify the project skeleton as per the domain of our application. At this point the project skeleton is looking like this-


Note that, we have removed the unnecessary code as well. We will use enzyme as primary testing library and mocha as test runner.

When we start TDDing React-Redux app, I try to follow specific order of adding tests and code for the component. Generally I follow bottom-up approach i.e. start building components in the following order — actions-reducers-containers-components. One can change the order as per preference.

Let’s start with action-

We will add a test case to make an API call to fetch the leaves-


```javascript
it('should dispatch an action to fetch the leaves', (done) => {
    const request = api.get(`/leaves`).reply(200, [leaveFormStub]);

    store.dispatch(leavesActions.fetchLeaves())
        .then((resp) => {
            request.done();
            let executedActions = store.getActions();
            expect(executedActions[0].type).to.equal(constants.LEAVE_FETCHING);
            expect(executedActions[1].type).to.equal(constants.LEAVES_FETCHED);
            expect(executedActions[1].leaves).to.deep.equal([leaveFormStub]);
            done();
        })
        .catch(done);
});
```


We have mocked the server call using nock. Here we assert that whenever ‘fetchLeaves’ is called, it should dispatch two actions- 1. LEAVE_FETCHING action — this is to show spinner till the time promise gets resolved. 2. LEAVES_FETCHED action — This is to update store with fetched leaves. At this moment, the test case is red, lets add a code to make it green.


```javascript
const leaveFetching = (leaveId) => ({
    type: constants.LEAVE_FETCHING,
    leaveId
});const leavesFetched = (leaves) => ({
    type: constants.LEAVES_FETCHED,
    leaves
});const fetchLeaves = () => {
    return (dispatch) => {
        dispatch(leaveFetching());
        return http.get(dispatch, `${config.serverUrl}/leaves`, null, {
            'Accept': APPLICATION_JSON
        }).then((resp) => {
            dispatch(leavesFetched(resp));
        }).catch(() => {
        })
    }
};
```

We have not handled the error scenario yet. Lets do that-

```javascript
it('should dispatch an action to set error when fetchLeaves returns the error', (done) => {
    const request = api.get(`/leaves`).reply(500, {error: 'error'});

    store.dispatch(leavesActions.fetchLeaves())
        .then((resp) => {
            request.done();
            let executedActions = store.getActions();
            expect(executedActions[0].type).to.equal(constants.LEAVE_FETCHING);
            expect(executedActions[1].type).to.equal(constants.LEAVE_ERROR);
            expect(executedActions[1].error).to.deep.equal('error occurred');
            done();
        })
        .catch(done);
});
```

Note that, we still need the spinner even if the API is going to return error. When it does so, we are expecting the LEAVE_ERROR action to be called. Lets add the code to make it green by adding the dispatch in the catch block.

```javascript
const fetchLeaves = () => {
    return (dispatch) => {
        dispatch(leaveFetching());
        return http.get(dispatch, `${config.serverUrl}/leaves`, null, {
            'Accept': APPLICATION_JSON
        }).then((resp) => {
            dispatch(leavesFetched(resp));
        }).catch((err) => {
            dispatch(leaveError('error occurred'))
        })
    }
};
```

At this point of time, we are sure that whenever fetchLeaves() is called it will make an API call and set leaves or error based on response status.

Lets build the reducer-

Writing tests for reducer is the easiest task in the React-Redux application. Here we are going to invoke the reducer with ‘LEAVES_FETCHED’ action and expect that the leaves are updated in the store.

```javascript
it("should return a new state with modified leaves when LEAVES_FETCHED action is received", () => {
    let leaves = [{dummy: 'dummy'}];
    const action = {type: constants.LEAVES_FETCHED, leaves: leaves};

    const updatedState = reducer(undefined, action);

    expect(updatedState.leaves).deep.equal(leaves);
});
```

We have not reduced the LEAVES_FETCHED action yet. Lets do that to make the test green. We will add a case in the reducer to handle this ‘type’ of action.

```javascript
case constants.LEAVES_FETCHED:
    return Object.assign({}, state, {
        leaves: action.leaves,
        status: "SUCCESS",
        error: null
    });
```

Bingo!! its green. However, we have not handled the error action yet. Here it comes-

```javascript
// TEST
it("should return a new state with status ERROR when a LEAVE_ERROR action is received", () => {
    let error = {error: 'dummy'};
    const action = {type: constants.LEAVE_ERROR, error: error};

    const updatedState = reducer(undefined, action);

    expect(updatedState.error).deep.equal(error);
});// CODE
case constants.LEAVE_ERROR:
    return Object.assign({}, state, {
        error: action.error,
        status: "ERROR"
    });
```

At this point, we are sure that whenever fetchLeaves API is called, its response data i.e. leaves are stored in the Redux store.

Lets build the container now-

We are going to build the dashboard container. It will pass the ‘fetchLeaves’ method and ‘leaves’ from the store as props to the connected component i.e. dashboard.jsx. The way I test it, is by making an attempt to call the fetchLeaves function, which should be available in the props of mounted enzyme wrapper. We can assert on the actions being dispatched when it is invoked.

```javascript
it('should pass fetchLeaves as props to the connected component', () => {
    const store = mockStore({leaves: {}});
    let shallowWrapper = wrapper.dive({context: {store}});
    shallowWrapper.prop('fetchLeaves')();
    expect(store.getActions()[0].type).deep.equal('LEAVE_FETCHING');
});
```

If we run above test, it will fail as it will not find fetchLeaves function in the props. Lets add this function in ‘mapDispatchToProps’ on the container.

```javascript
const mapDispatchToProps = (dispatch) => {
    return {
        fetchLeaves: () => {
            dispatch(leavesActions.fetchLeaves())
        }
    };
};
```

And.. its green!!

Lets do the same trick for the ‘leaves’.

```javascript
it('should pass leaves to connected component', () => {
    const leaves = [{dummy: 'dummy'}];
    const store = mockStore({leaves: {leaves: leaves}});
    let shallowWrapper = wrapper.dive({context: {store}});
    expect(shallowWrapper.prop('leaves')).deep.equal(leaves);
});
```

Here we need to add ‘leaves’ in the ‘mapStateToProps’.

```javascript
const mapStateToProps = (state) => {

    return {
        leaves: state.leaves.leaves
    }
};
```

We are done with the container. Now the final task.

Lets build the component.

We will call the fetchLeaves method from props, as the component is being mounted. Here will will use React lifecycle hooks to do this.

```javascript
it('should make an action to fetch leaves when component is loaded', () => {wrapper = shallow(<Dashboard navigateToNewLeave={navigateToNewLeaveStub} fetchLeaves={fetchLeavesStub} leaves={leaves}/>);
    expect(fetchLeavesStub.called).equal(true);
});
```

Here fetchLeavesStub is the stub created using sinon. Lets add the code to make it green. We will call the fetchLeaves from componentWillMount() lifecycle method.

```javascript
componentWillMount() {
    this.props.fetchLeaves();
}
```

Our plan is to show the list of leaves in the tabular form. We will use table from react-bootstrap.

Our leave has four fields — fromDate, toDate, reason and type. Lets add a test case to have these four headers in the table.

```javascript
describe('Table', () => {
    it('should render the table headers', () => {
        const tableHeaders = wrapper.find('thead tr');

        expect(tableHeaders.childAt(0).text()).equal('From Date');
        expect(tableHeaders.childAt(1).text()).equal('To Date');
        expect(tableHeaders.childAt(2).text()).equal('Reason');
        expect(tableHeaders.childAt(3).text()).equal('Type');
    });
});
```

Its pretty simple, we are trying to find the ‘thead’ tag an ‘tr’ in it. Once found, we are asserting the four headers and the texts they have rendered. Lets add the code for it.

```javascript
render() {
    return (
        <div className="container">
           <FormGroup>
                <Row>
                    <Table>
                        <thead>
                            <tr>
                                <th>From Date</th>
                                <th>To Date</th>
                                <th>Reason</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                    </Table>
                </Row>
            </FormGroup>
        </div>
    )
}
```

