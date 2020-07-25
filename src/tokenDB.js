import PouchDB from "pouchdb";

export default class TDB {
  constructor(name) {
    this.db = new PouchDB("DwollaToken", {
      revs_limit: 1,
      auto_compaction: true
    });
  }
  async readKey() {
    let allNotes = await this.db.allDocs({ include_docs: true });
    let notes = {};

    allNotes.rows.forEach(n => (notes[n.doc.key] = n.doc));

    return notes;
  }

  async setKey(key) {
    console.log("setting key in pouchdb");
    const res = await this.db.post({ key });
    return res;
  }

  async deleteKeys() {
    console.log("deleting cached tokens.....");
    await this.db.destroy().then(x => {
      this.db = new PouchDB("DwollaToken", {
        revs_limit: 1,
        auto_compaction: true
      });
    });
  }
}
