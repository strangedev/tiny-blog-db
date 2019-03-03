import * as Future from "fluture";
import {getVersion} from "../../connector/db";

const version = "v1alpha";
const getDb = (host, port) => getVersion(version, host, port);

function insert(host, port) {
    return blogEntry =>
        getDb(host, port)
            .chain(
                db => Future.tryP(() =>
                    db.collection("BlogEntry").insertOne(blogEntry.marshal(true))
                )
            )
            .map(result => result.insertedId)
            .chain(
                insertedId => {
                    let bodies = [];
                    for (let tag of blogEntry.tags) {
                        bodies.push({BlogEntryId: insertedId, Tag: tag});
                    }
                    return getDb(host, port)
                        .chain(
                            db => Future.tryP(() =>
                                db.collection("Tag_BlogEntry").insertMany(bodies)
                            )
                        ).map(() => insertedId);
                }
            );
}

function remove(host, port) {
    return blogEntry =>
        getDb(host, port)
            .chain(
                db => Future.tryP(() =>
                    db.collection("Tag_BlogEntry")
                        .deleteMany({BlogEntryId: blogEntry.id})
                )
            ).chain(
                () => getDb(host, port)
                    .chain(
                        db => Future.tryP(() =>
                            db.collection("BlogEntry")
                                .deleteOne({_id: blogEntry.id})
                        )
                    )
            ).chain(result => {
                if (result.deletedCount === 1) {
                    return Future.of(result.deletedCount);
                } else {
                    return Future.reject("Nothing deleted.")
                }
            }
        )
}

export {
    insert,
    remove
}