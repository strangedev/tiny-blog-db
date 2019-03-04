import * as Future from "fluture";

function insert(getDb) {
    return blogEntry =>
       getDb()
           .chain(
               ({db, closeWith}) => Future.tryP(
                   () => db.collection("BlogEntry").insertOne(blogEntry.marshal(true))
               ).map(result => ({id: result.insertedId, db, closeWith}))
       ).chain(
           ({id, db, closeWith}) => {
               let bodies = [];
               for (let tag of blogEntry.tags) {
                   bodies.push({BlogEntryId: id, Tag: tag});
               }
               return Future.tryP(
                   () => db.collection("Tag_BlogEntry").insertMany(bodies)
               ).chain(() => closeWith(id))
           }
           );
}

function remove(getDb) {
    return blogEntry =>
        getDb()
            .chain(
                ({db, closeWith}) => Future.tryP(
                    () => db.collection("Tag_BlogEntry")
                        .deleteMany({BlogEntryId: blogEntry.id})
                ).map(() => ({db, closeWith}))
            ).chain(
                ({db, closeWith}) => Future.tryP(
                    () => db.collection("BlogEntry")
                                .deleteOne({_id: blogEntry.id})
                        ).chain(result => closeWith(result.deletedCount))
            );
}

export {
    insert,
    remove
}