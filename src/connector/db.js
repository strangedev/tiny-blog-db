import * as R from "ramda";
import * as Future from "fluture";
import * as MongoDb from "mongodb";

function getDb(version, host, port) {
    return () => Future.Future((reject, resolve) => {
        const client = new MongoDb.MongoClient(`mongodb://${host}:${port}/${version}`);

        function closeWith(value) {
            return Future.tryP(
                () => client.close()
            ).map(
                () => value
            );
        }

        client.connect(
            err => {
                if (R.isNil(err)) {
                    resolve({
                        db: client.db(version),
                        closeWith
                    });
                } else {
                    reject(err);
                }
        });
    });
}

export {
    getDb
}