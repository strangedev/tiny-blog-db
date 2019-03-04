import * as Future from "fluture";

function all(getDb) {
    return () =>
        getDb().chain(
            db => Future.tryP(() =>
                db.collection("Tag_BlogEntry").distinct("Tag")
            )
        );
}

export {
    all
}