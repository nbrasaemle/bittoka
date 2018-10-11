const mongoose = require("mongoose");
const db = require("../models");
const group = require('../constants/permissionGroups')

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/bittokaDB");

const categoryData = [
  {
  name: 'bitcoin-story',
  displayName: 'Bitcoin Story',
  description: `It's all about stories and bitcoins and stories about bitcoins.`,
  settings: {
    allowedPosters: [group.USER, group.ADMIN],
    defaultContentPrice: 0,
    posterSetsContentPrice: true,
    costToComment: 0,
    costToPost: 0
  },
  tags: ["Success", "Getting Started"]
},
{
  name: 'stories',
  displayName: 'Story',
  description: `It's all about the stories.`,
  settings: {
    allowedPosters: [group.USER, group.ADMIN],
    defaultContentPrice: 0,
    posterSetsContentPrice: true,
    costToComment: 0,
    costToPost: 0
  },
  tags: ["Drama", "Humor","Fantasy", "Paranormal Romance", "Thriller"]
},
{
  name: 'listoka',
  displayName: 'Listoka',
  description: `It's all about listoka.`,
  settings: {
    allowedPosters: [group.USER, group.ADMIN],
    defaultContentPrice: 0,
    posterSetsContentPrice: true,
    costToComment: 0,
    costToPost: 0
  },
  tags: ["Updates", "Maintenance"]
}
]

db.Category.deleteMany()
  .then(() => db.Category.create(categoryData))
  .then(dbCategory => {
    console.log('\n>>>>> Category:\n', dbCategory)
    process.exit(0)
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })