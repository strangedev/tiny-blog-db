import {BlogEntry} from "tiny-blog-model";
import * as BlogEntryView from "./src/BlogEntry/view";
import * as DB from "./src/connector/db";
import * as BlogEntryMutation from "./src/BlogEntry/mutation";
import * as TagView from "./src/Tag/view";
import * as semver from "semver";

const packageJson = require('./package.json');

function getDb(host, port) {
    return DB.getDb(semver.major(packageJson.version), host, port);
}

function store(host, port) {
    return {
        getDb: getDb(host, port),
        BlogEntry: {
            view: {
                byTag: BlogEntryView.byTag(getDb(host, port)),
                newest: BlogEntryView.newest(getDb(host, port))
            },
            mutation: {
                insert: BlogEntryMutation.insert(getDb(host, port)),
                update: () => {
                },
                remove: BlogEntryMutation.remove(getDb(host, port))
            }
        },
        Tag: {
            view: {
                all: TagView.all(getDb(host, port))
            }
        }
    }
}

export {
    BlogEntry,
    store
}