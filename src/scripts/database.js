import { openDB } from 'idb';

const DATABASE_NAME = 'storiyboard';
const DATABASE_VERSION = 2;
const OBJECT_STORE_NAME = 'saved-story';
const PENDING_STORE = 'pending-stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database, oldVersion) => {
    if (oldVersion < 1) {
      database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
    }
    if (oldVersion < 2) {
      database.createObjectStore(PENDING_STORE, { keyPath: 'id' });
    }
  },
});

const Database = {
  async putStory(story) {
    if (!Object.hasOwn(story, 'id')) {
      throw new Error('`id` is required to save.');
    }

    return (await dbPromise).add(OBJECT_STORE_NAME, story);
  },

  async getStoryById(id) {
    if (!id) {
      throw new Error('`id` is required.');
    }

    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async removeStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },

  async searchStories(query) {
    const allStories = await this.getAllStories();

    const q = query.toLowerCase().trim();
    if (!q) return allStories;

    return allStories.filter((story) => {
      const nameMatch = story.name?.toLowerCase().includes(q);
      const descPreview = story.description?.toLowerCase().slice(0, 200); // limit desc search for performance
      const descMatch = descPreview?.includes(q);
      const locMatch = story.placeName?.toLowerCase().includes(q);

      return nameMatch || descMatch || locMatch;
    });
  },

  async savePendingStory(story) {
    return (await dbPromise).add(PENDING_STORE, story);
  },

  async getPendingStories() {
    return (await dbPromise).getAll(PENDING_STORE);
  },

  async deletePendingStory(id) {
    return (await dbPromise).delete(PENDING_STORE, id);
  },

  async updatePendingStory(id, updates) {
    if (!id) {
      throw new Error('`id` is required to update pending story.');
    }

    const db = await dbPromise;
    const tx = db.transaction(PENDING_STORE, 'readwrite');
    const store = tx.objectStore(PENDING_STORE);

    const existingStory = await store.get(id);
    if (!existingStory) {
      console.warn(`No pending story found with id: ${id}`);
      return null;
    }

    const updatedStory = { ...existingStory, ...updates };

    await store.put(updatedStory);
    await tx.done;

    return updatedStory;
  },
};

export default Database;
