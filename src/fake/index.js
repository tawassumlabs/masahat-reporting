const { faker } = require('@faker-js/faker');
const fs = require('fs');

function fakeCreators(count = 50) {
  function createRow() {
    const row = {
      name: faker.person.fullName(),
      screen_name: faker.internet.userName(),
      followers_count: faker.number.int({ min: 0, max: 10000 }),
      profile_image: faker.image.avatar(),
      hosted_count: faker.number.int({ min: 0, max: 1000 }),
      speaker_count: faker.number.int({ min: 0, max: 1000 }),
      listener_count: faker.number.int({ min: 0, max: 10000 }),
      activity_count: 0,
    };

    row.activity_count = row.hosted_count + row.speaker_count + row.listener_count;

    return row;
  }

  return [
    ['name', 'screen_name', 'followers_count', 'profile_image', 'hosted_count', 'speaker_count', 'listener_count', 'activity_count'],
    ...faker.helpers.multiple(createRow, { count }).map(Object.values),
  ];
}

module.exports = { fakeCreators };