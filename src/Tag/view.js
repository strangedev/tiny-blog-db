import * as Future from "fluture";

function all(getDb) {
    return () =>
        getDb().chain(
            ({db, closeWith}) => Future.tryP(
                () => db.collection("Tag_BlogEntry").distinct("Tag")
            ).chain(tags => closeWith(tags))
        )
}

export {
    all
}