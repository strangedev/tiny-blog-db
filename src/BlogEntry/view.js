import * as Future from "fluture";
import * as R from "ramda";
import {BlogEntry} from "tiny-blog-model";


function newest(getDb) {
    return (offset, limit) =>
        getDb().chain(
            ({db, closeWith}) => Future.Future(
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
                entries => R.map(e => BlogEntry.unMarshal(e), entries)
            ).chain(closeWith)
        );
}

function byTag(dbFactory){
    return (tags) => {
        return Future.reject("Not implemented");
    }
}

export {
    newest,
    byTag
}