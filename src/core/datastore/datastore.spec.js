
import expect from 'expect';
import { DataStore, DataStoreType } from './datastore';
import { NetworkStore } from './networkstore';
import { CacheStore } from './cachestore';
import { SyncStore } from './syncstore';
import { KinveyError } from '../errors';
import { Client } from '../client';
import { randomString } from '../utils';
const collection = 'Books';

describe('DataStore', () => {
  before(() => {
    Client.init({
      appKey: randomString(),
      appSecret: randomString()
    });
  });

  describe('constructor', () => {
    it('should throw an error if the DataStore class is tried to be instantiated', () => {
      expect(() => {
        const store = new DataStore(collection);
        return store;
      }).toThrow(KinveyError);
    });
  });

  describe('collection()', () => {
    it('should throw an error if a collection is not provided', () => {
      expect(() => {
        const store = DataStore.collection();
        return store;
      }).toThrow(KinveyError);
    });

    it('should throw an error if the collection is not a string', () => {
      expect(() => {
        const store = DataStore.collection({});
        return store;
      }).toThrow(KinveyError);
    });

    describe('tagging', () => {
      describe('a NetworkStore', () => {
        it('should throw an error', () => {
          expect(() => {
            DataStore.collection(collection, DataStoreType.Network, { tag: 'any-tag' });
          }).toThrow();
        });
      });

      const offlineCapableStoreTypes = [DataStoreType.Cache, DataStoreType.Sync];
      offlineCapableStoreTypes.forEach((storeType) => {
        describe(`a ${storeType}Store`, () => {
          it('should throw an error if the tag is not a string', () => {
            expect(() => {
              DataStore.collection(collection, storeType, { tag: {} });
            }).toThrow();
          });

          it('should throw an error if the tag is an emptry string', () => {
            expect(() => {
              DataStore.collection(collection, storeType, { tag: '' });
            }).toThrow();
          });

          it('should throw an error if the tag is a whitespace string', () => {
            expect(() => {
              DataStore.collection(collection, storeType, { tag: '    \n  ' });
            }).toThrow();
          });

          it('should throw an error if the tag contains invalid characters', () => {
            expect(() => {
              DataStore.collection(collection, storeType, { tag: '  %  sometag  !' });
            }).toThrow();
          });

          it('should work if the provided tag is valid', () => {
            DataStore.collection(collection, storeType, { tag: 'some-valid-tag' });
          });
        });
      });
    });

    it('should return a NetworkStore', () => {
      const store = DataStore.collection(collection, DataStoreType.Network);
      expect(store).toBeA(NetworkStore);
    });

    it('should return a CacheStore', () => {
      const store = DataStore.collection(collection, DataStoreType.Cache);
      expect(store).toBeA(CacheStore);
    });

    it('should return a SyncStore', () => {
      const store = DataStore.collection(collection, DataStoreType.Sync);
      expect(store).toBeA(SyncStore);
    });

    it('should return a CacheStore by default', () => {
      const store = DataStore.collection(collection);
      expect(store).toBeA(CacheStore);
    });
  });

  describe('getInstance()', () => {
    afterEach(function () {
      expect.restoreSpies();
    });

    it('should call collection()', () => {
      const spy = expect.spyOn(DataStore, 'collection');
      DataStore.getInstance(collection);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('clearCache()', () => {
    it('should clear all the entities in the cache', () => {
      const entity = {};
      const store = new SyncStore(collection);
      return store.save(entity)
        .then(() => {
          return DataStore.clearCache();
        })
        .then(() => {
          return store.find().toPromise();
        })
        .then((entities) => {
          expect(entities).toEqual([]);
          return store.pendingSyncEntities();
        })
        .then((entities) => {
          expect(entities).toEqual([]);
        });
    });
  });
});
