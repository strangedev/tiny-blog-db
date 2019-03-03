import * as Model from "tiny-blog-model";
import * as v1alphaBlogEntryView from "./v1alpha/BlogEntry/view";
import {getVersion} from "./connector/db";
import * as v1alphaBlogEntryMutation from "./v1alpha/BlogEntry/mutation";
import * as v1alphaTagView from "./v1alpha/Tag/view";

const v1alpha = {
    model: {
        BlogEntry: Model.v1alpha.BlogEntry
    },
    store: (host, port) => ({
        getDb: () => getVersion("v1alpha", host, port),
        BlogEntry: {
            view: {
                byTag: v1alphaBlogEntryView.byTag(host, port),
                newest: v1alphaBlogEntryView.newest(host, port)
            },
            mutation: {
                insert: v1alphaBlogEntryMutation.insert(host, port),
                update: () => {},
                remove: v1alphaBlogEntryMutation.remove(host, port)
            }
        },
        Tag: {
            view: {
                all: v1alphaTagView.all(host, port)
            }
        }
    })
};

export {
    v1alpha
}