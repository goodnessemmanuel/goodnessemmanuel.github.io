---
layout: post
title:  TDDing React Routes
date:   2021-11-26 21:00:00 +0100
tags: spring-boot stomp web-sockets microservices service-registry
author: Kunal Hire
permalink: /blog/:title.html
category: expertise
image: /assets/images/blog-tdd-react-routes.jpeg
breadcrumb:
- name: Home
  url: /en/
- name: Blog Posts
  url: /blog/

lang: en
---


**author** : {{page.author}}

I explained how to build the React-Redux application using Test Driven Development(TDD) in my earlier blog here. However, I did not cover the TDD part for React-Routes in that bog. If your application is missing the tests for routes or if you want to learn how to build it using TDD then this blog is for you.
Background: I was pairing with one of the backend developers on a React-Redux application. We had very good test coverage as the whole application was built using TDD. However, when we wanted to add a new page, I did not start with tests as testing routes was a little bit complex and was simply omitted in the front-end development community. My fellow developer had a valid argument that the routes are the most important part of a Single Page Application(SPA) hence they must be built using TDD. As a result of which we came up with the following approach.
Code in Action:
What should be tested in React Routes? In a typical multi-route React application, the routes are defined in a separate file and wrapped in a bunch of providers. First of all, we should decouple the providers and have routes(<Switch>) element in a different component. A typical react routes elements look like this-

```xml
<Switch>
<Route exact path={paths.LOGIN} component={LoginContainer}/>
<Route exact path={paths.EDIT_PROFILE} component={ProfileContainer}/>
<Switch>
```

It is important to test “hey route, which component(page) will you render on this path?”
In the above code snippet, the ProfileContainer page is rendered when the application route changes to paths.EDIT_PROFILE which is /:userId. Therefore it is important to test if the route is rendered with correctpath and component property.
The Test Case:
Here is the test case for the above route-
```xml
it('should render the route for edit profile', 
  function () { 
    const routes = wrapper.find('Switch'); 
    const editRoute = routes.childAt(1); 
    expect(editRoute.prop("path")).toEqual(paths.EDIT_PROFILE); 
    expect(editRoute.prop("component")).toEqual(ProfileContainer); 
});
```
