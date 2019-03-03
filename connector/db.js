import * as R from "ramda";
import * as Future from "fluture";
import * as MongoDb from "mongodb";

function getVersion(version, host, port) {
    return Future.Future((reject, resolve) => {
        const client = new MongoDb.MongoClient(`mongodb://${host}:${port}/${version}`);
        client.connect(err => {
            if (!R.isNil(err)) {
                reject(err);
            } else {
                resolve(client.db(version));
            }
        });
    });
}

export {
    getVersion
}