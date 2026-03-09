const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const serviceAccount = require("./skey.json");
admin.initializeApp({credential: admin.credential.cert(serviceAccount),});
async function deleteAllUsers(nextPageToken) {
  const listUsersResult = await getAuth().listUsers(1000, nextPageToken);
  const uids = listUsersResult.users.map(user => user.uid);
  if (uids.length > 0) {await getAuth().deleteUsers(uids);
    console.log(`Deleted ${uids.length} users`);}
  if (listUsersResult.pageToken) {
    await deleteAllUsers(listUsersResult.pageToken);}}
deleteAllUsers().then(() => console.log("All users deleted")).catch(console.error);