simplicity-ui
=============

View the site here:
http://cityofasheville.github.io/simplicity-ui

A webapp to provide simple access to city data. Built on an AngularJS frontend with an ArcGIS REST API on the back.


##GETTING STARTED

###Installation

You'll need Node.js to work on SimpliCity. 

1. Clone the repo, and cd into that directory
2. Install dependencies with npm

         npm install
3. You can serve it locally with gulp, and it'll watch for changes
         
        gulp serve

###Configuration
####There are 2 main configuration files:

#####app/simplicity.frontend.config.js

An assortment of frontend configuration stuff like colors, links, and drop-down values that probably can be abstracted and cleaned up.

#####app/simplicity.backend.config.js

Defines all the URIs to the ArcGIS feature services used by the app. It includes the simplicityBackend factory also exposes two methods in particular:

######simplicityBackend.simplicitySearch
  All search functionality is routed through this method.
######simplicityBackend.simplicityQuery
  All queries are routed through this method.

An adapter, like app/adapters/simplicity.arcgis.rest.api.adapter.js, that contains set of queries defined as angular constants, and factory that exposes methods for querying an API, in this case the ArcGIS REST API, must be injected into the simplicityBackend factory.

Additionally, each topic contains a set of views and a factory that is used to build that topic.


#License
The MIT License (MIT)

Copyright (c) 2015 City of Asheville, NC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
