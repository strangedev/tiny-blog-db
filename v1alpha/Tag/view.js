import * as Future from "fluture";
import {getVersion} from "../../connector/db";

const version = "v1alpha";
const getDb = (host, port) => getVersion(version, host, port);

function all(host, port) {
    return () =>
        getDb(host, port)
            .chain(
                db => Future.tryP(() =>
                    db.collection("Tag_BlogEntry").distinct("Tag")
                )
            );
}

export {
    all
}