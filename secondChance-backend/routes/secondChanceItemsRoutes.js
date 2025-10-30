const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const connectToDatabase = require('../models/db')
const logger = require('../logger')

// Define the upload directory path
const directoryPath = 'public/images'

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath) // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Use the original file name
  }
})

const upload = multer({ storage })

// Get all secondChanceItems
router.get('/', async (req, res, next) => {
  logger.info('/ called')
  try {
    // Task 1: Retrieve the database connection
    const db = await connectToDatabase()

    // Task 2: Use the collection() method to retrieve the secondChanceItems collection
    const collection = db.collection('secondChanceItems')

    // Task 3: Fetch all secondChanceItems
    const secondChanceItems = await collection.find({}).toArray()

    // Add full image URL to each item
    const baseUrl = 'http://localhost:3060/images/'
    secondChanceItems.forEach(item => {
      if (item.imageName) {
        item.imageUrl = `${baseUrl}${item.imageName}`
      }
    })

    res.json(secondChanceItems)
  } catch (e) {
    logger.console.error('oops something went wrong', e)
    next(e)
  }
})

// Add a new item
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    // Task 1: Retrieve the database connection
    const db = await connectToDatabase()

    // Task 2: Use the collection() method to retrieve the secondChanceItems collection
    const collection = db.collection('secondChanceItems')

    // Task 3: Create a new secondChanceItem from the request body
    const secondChanceItem = req.body

    // Task 4: Get the last id, increment it by 1, and set it to the new secondChanceItem
    const lastItemQuery = await collection.find().sort({ id: -1 }).limit(1).toArray()
    if (lastItemQuery.length > 0) {
      secondChanceItem.id = (parseInt(lastItemQuery[0].id) + 1).toString()
    } else {
      secondChanceItem.id = '1' // Default to 1 if no items exist
    }

    // Task 5: Set the current date in the new item
    const date_added = Math.floor(new Date().getTime() / 1000)
    secondChanceItem.date_added = date_added

    // Task 6: Add the secondChanceItem to the database
    const result = await collection.insertOne(secondChanceItem)

    // Task 7: Respond with the inserted item
    res.status(201).json({
      ...secondChanceItem,
      _id: result.insertedId // Include the MongoDB-generated ID
    })
  } catch (e) {
    next(e)
  }
})

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
  try {
    // Task 1: Retrieve the database connection
    const db = await connectToDatabase()

    // Task 2: Use the collection() method to retrieve the secondChanceItems collection
    const collection = db.collection('secondChanceItems')

    // Task 3: Find a specific secondChanceItem by its ID
    const id = req.params.id
    const secondChanceItem = await collection.findOne({ id })

    // Task 4: Return the secondChanceItem or an error message if not found
    if (!secondChanceItem) {
      return res.status(404).send('secondChanceItem not found')
    }

    res.json(secondChanceItem)
  } catch (e) {
    next(e)
  }
})

// Update an existing item
router.put('/:id', async (req, res, next) => {
  try {
    // Task 1: Retrieve the database connection
    const db = await connectToDatabase()

    // Task 2: Use the collection() method to retrieve the secondChanceItems collection
    const collection = db.collection('secondChanceItems')

    // Task 3: Check if the secondChanceItem exists
    const id = req.params.id
    const existingItem = await collection.findOne({ id })
    if (!existingItem) {
      return res.status(404).send('secondChanceItem not found')
    }

    // Task 4: Update the item's attributes
    const secondChanceItem = {
      category: req.body.category,
      condition: req.body.condition,
      age_days: req.body.age_days,
      description: req.body.description,
      age_years: Number((req.body.age_days / 365).toFixed(1)), // Calculate age in years
      updatedAt: new Date() // Current date
    }

    const updatepreloveItem = await collection.findOneAndUpdate(
      { id },
      { $set: secondChanceItem },
      { returnDocument: 'after' }
    )

    // Task 5: Send confirmation
    if (updatepreloveItem) {
      res.json({ uploaded: 'success' })
    } else {
      res.json({ uploaded: 'failed' })
    }
  } catch (e) {
    next(e)
  }
})

// Delete an existing item
router.delete('/:id', async (req, res, next) => {
  try {
    // Task 1: Retrieve the database connection
    const db = await connectToDatabase()

    // Task 2: Use the collection() method to retrieve the secondChanceItems collection
    const collection = db.collection('secondChanceItems')

    // Task 3: Find a specific secondChanceItem by ID and send an appropriate message if it doesn't exist
    const id = req.params.id
    const secondChanceItem = await collection.findOne({ id })
    if (!secondChanceItem) {
      logger.error('secondChanceItem not found')
      return res.status(404).json({ error: 'secondChanceItem not found' })
    }

    // Task 4: Delete the object and send an appropriate message
    await collection.deleteOne({ id })
    res.json({ deleted: 'success' })
  } catch (e) {
    next(e)
  }
})

module.exports = router
