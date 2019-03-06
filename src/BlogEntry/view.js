import * as Future from "fluture";
import * as R from "ramda";
import {BlogEntry} from "tiny-blog-model";
import {ObjectId} from "mongodb";


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
                R.partial(R.map, [BlogEntry.unMarshal])
            ).chain(closeWith)
        );
}

function byTag(getDb){
    return (tags, offset, limit) => {
        let future = getDb();
        for (let tag of tags) {  // fetch matching BlogEntry ids & calculate relevance
            future = future.chain(
                ({db, closeWith, acc}) => {
                    return Future.node(
                        done => db.collection("Tag_BlogEntry")
                            .find({Tag: tag})
                            .skip(offset)
                            .limit(limit)
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
            ({db, acc, closeWith}) => {  // fetch BlogEntries
                return Future.node(
                    done => db.collection("BlogEntry")
                        .find({
                            _id: {
                                $in: R.map(ObjectId, Object.keys(acc))
                            }
                        }).toArray(done)
                ).map(
                    R.partial(R.map, [BlogEntry.unMarshal])
                ).map(
                    documents => ({documents, acc, closeWith})
                );
            }).chain(
                ({documents, acc, closeWith}) => {  // sort by relevance
                    let unSorted = R.map(
                        e => ({relevance: acc[e.id.toString()], blogEntry: e}),
                        documents
                    );
                    let sorted = R.reverse(R.sortBy(R.prop("relevance"), unSorted));  // most relevant first
                    return closeWith(R.map(R.prop("blogEntry"), sorted));
                }
        );
    }
}

export {
    newest,
    byTag
}