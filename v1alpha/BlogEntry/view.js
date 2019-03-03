import * as Future from "fluture";
import {getVersion} from "../../connector/db";
import * as R from "ramda";
import {v1alpha} from "tiny-blog-model";

const version = "v1alpha";
const getDb = (host, port) => getVersion(version, host, port);

function newest(host, port) {
    return (offset, limit) =>
        getDb(host, port)
            .chain(db => Future.Future(
                (reject, resolve) =>  {
                    db.collection("BlogEntry")
                        .find()
                        .sort({ date: 1 })
                        .skip(offset)
                        .limit(limit)
                        .toArray(
                            (err, results) => {
                                if (R.isNil(err)) resolve(results);
                                else reject(err);
                            }
                        )
                }
            ).map(
                entries => R.map(e => v1alpha.model.BlogEntry.unMarshal(e), entries)
            )
        );
}

function byTag(host, port){
    return (tags) => {
        return Future.reject("Not implemented");
    }
}

export {
    newest,
    byTag
}