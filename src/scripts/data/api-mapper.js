import MapUtil from '../utils/map';

const cache = new Map();

async function getPlace(lat, lon) {
  const key = `${lat},${lon}`;

  if (cache.has(key)) return cache.get(key);

  try {
    const place = await MapUtil.getPlaceNameByCoordinate(lat, lon);
    cache.set(key, place);
    return place;
  } catch (err) {
    console.error('Map error:', err);
    return `${lat}, ${lon}`;
  }
}

export async function storyListMapper(story) {
  return Promise.all(
    story.map(async (item) => {
      const placeName = await getPlace(item.lat, item.lon);

      return {
        ...item,
        placeName,
      };
    }),
  );
}

export async function storyDetailMapper(story) {
  return {
    ...story,
    placeName: await MapUtil.getPlaceNameByCoordinate(story.lat, story.lon),
  };
}
