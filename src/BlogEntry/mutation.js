import * as Future from "fluture";

function insert(getDb) {
    return blogEntry =>
       getDb().chain(
           db => Future.tryP(
               () => db.collection("BlogEntry").insertOne(blogEntry.marshal(true))
           )
       ).map(
           result => result.insertedId
       ).chain(
           insertedId => {
               let bodies = [];
               for (let tag of blogEntry.tags) {
                   bodies.push({BlogEntryId: insertedId, Tag: tag});
               }
               return getDb().chain(
                   db => Future.tryP(() =>
                           db.collection("Tag_BlogEntry").insertMany(bodies)
                   )
               ).map(
                   () => insertedId
               );
           }
           );
}

function remove(getDb) {
    return blogEntry =>
        getDb()
            .chain(
                db => Future.tryP(
                    () => db.collection("Tag_BlogEntry")
                        .deleteMany({BlogEntryId: blogEntry.id})
                    )
            ).chain(
                () => getDb()
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
        );
}

export {
    insert,
    remove
}