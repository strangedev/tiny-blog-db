import * as Future from "fluture";
import * as R from "ramda";
import {BlogEntry} from "tiny-blog-model";


function newest(getDb) {
    return (offset, limit) =>
        getDb().chain(
            ({db, closeWith}) => Future.node(
                done => db.collection("BlogEntry")
                    .find()
                    .sort({ date: 1 })
                    .skip(offset)
                    .limit(limit)
                    .toArray(done)
            ).map(
                entries => R.map(e => BlogEntry.unMarshal(e), entries)
            ).chain(closeWith)
        );
}

function byTag(getDb){
    return (tags) => {
        let future = getDb();
        for (let tag of tags) {
            future = future.chain(
                ({db, closeWith, acc}) => {
                    return Future.node(
                        done => db.collection("Tag_BlogEntry")
                            .find({Tag: tag})
                            .toArray(done)
                    ).chain(
                        documents => {
                            let newAcc = R.fromPairs(
                                R.map(
                                    document => [document.BlogEntryId, 1],
                                    documents
                                )
                            );

                            return Future.of({
                                db,
                                closeWith,
                                acc: R.mergeWith(R.add, acc, newAcc)
                            });
                        }
                    )
                }
            );
        }
        return future.chain(
            ({acc, closeWith}) => {
                let unSorted = [];
                for (let key of Object.keys(acc)) {
                    unSorted.push({id: key, relevance: acc[key]});
                }
                let sorted = R.reverse(R.sortBy(R.prop("relevance"), unSorted));
                return closeWith(R.map(R.prop("id"), sorted));
            }

            );
    }
}

export {
    newest,
    byTag
}