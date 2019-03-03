# tiny-blog-model

Data model and database connector for tiny-blog.

Uses a MongoDB as storage backend, although the model classes 
for each model version can be used on their own without a database connection.

Models follow the tiny-blog-api spec: https://github.com/strangedev/tiny-blog-api/tree/master/spec

### Related repos

 - tiny-blog: https://github.com/strangedev/tiny-blog 
 - tiny-blog-api: https://github.com/strangedev/tiny-blog-api
 - tiny-blog-backend: https://github.com/strangedev/tiny-blog-backend
 - tiny-blog-ui: https://github.com/strangedev/tiny-blog-ui

## Usage

### API Structure

 - versionName
    - model
    - store
        - getDb
        - ResourceName
            - view
            - mutation
            
e.g.

 - v1alpha
    - model
        - BlogEntry
    - store
        - getDb
        - BlogEntry
            - view
                - newest
                - byTag
            - mutation 
                - insert
                - update
                - delete
        - Tag
            - view
                - all

#### Example

```javascript
import {v1alpha} from "tiny-blog-model";
const v1Store = v1alpha.store("localhost", 27017);

let cancel = v1Store.BlogEntry.view.newest().fork(
    console.err,
    result => {
        // do something with the result...
        console.log(result);
    }
);

```

## Development

```bash
yarn install

# transpile JS to build/
yarn run build
```