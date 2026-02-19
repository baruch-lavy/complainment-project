import { ObjectId } from "mongodb";
import fs from "fs/promises";
import path from "path";

import { logger } from "../../services/logger.service.js";
import { dbService } from "../../services/db.service.js";
import { asyncLocalStorage } from "../../services/als.service.js";

const CSV_FILE_PATH = path.join(process.cwd(), "data", "complaints.csv");

export const complaintService = {
  remove,
  query,
  getById,
  add,
  update,
};

// CSV-based functions (alternative to DB functions)
export const complaintServiceCSV = {
  removeCSV,
  queryCSV,
  getByIdCSV,
  addCSV,
  updateCSV,
};

async function query() {
  try {
    const collection = await dbService.getCollection("complaints");
    let complaintCursor = await collection.find();

    const complaints = await complaintCursor.toArray();
    return complaints.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    logger.error("cannot find complaints", err);
    throw err;
  }
}

async function getById(complaintId) {
  try {
    const criteria = { _id: ObjectId.createFromHexString(complaintId) };

    const collection = await dbService.getCollection("complaints");
    const complaint = await collection.findOne(criteria);

    complaint.createdAt = complaint._id.getTimestamp();
    return complaint;
  } catch (err) {
    logger.error(`while finding complaint ${complaintId}`, err);
    throw err;
  }
}

async function remove(complaintId) {
  const { loggedinUser } = asyncLocalStorage.getStore();
  const { _id: ownerId, isAdmin } = loggedinUser;

  try {
    const criteria = {
      _id: ObjectId.createFromHexString(complaintId),
    };
    if (!isAdmin) criteria["owner._id"] = ownerId;

    const collection = await dbService.getCollection("complaints");
    const res = await collection.deleteOne(criteria);

    if (res.deletedCount === 0) throw "Not your complaint";
    return complaintId;
  } catch (err) {
    logger.error(`cannot remove complaint ${complaintId}`, err);
    throw err;
  }
}

async function add(complaint) {
  try {
    const collection = await dbService.getCollection("complaints");
    const id = await collection.insertOne({
      ...complaint,
      createdAt: Date.now(),
    });

    return { ...complaint, _id: id?.insertedId };
  } catch (err) {
    logger.error("cannot insert complaint", err);
    throw err;
  }
}

async function update(complaint) {
  const complaintToSave = { vendor: complaint.vendor, speed: complaint.speed };

  try {
    const criteria = { _id: ObjectId.createFromHexString(complaint._id) };

    const collection = await dbService.getCollection("complaints");
    await collection.updateOne(criteria, { $set: complaintToSave });

    return complaint;
  } catch (err) {
    logger.error(`cannot update complaint ${complaint._id}`, err);
    throw err;
  }
}

function _buildCriteria(filterBy) {
  const criteria = {
    vendor: { $regex: filterBy.txt, $options: "i" },
    speed: { $gte: filterBy.minSpeed },
  };

  return criteria;
}

function _buildSort(filterBy) {
  if (!filterBy.sortField) return {};
  return { [filterBy.sortField]: filterBy.sortDir };
}

// ============ CSV-BASED FUNCTIONS ============

// Helper: Read CSV file and parse to array of objects
async function _readCSV() {
  try {
    const csvData = await fs.readFile(CSV_FILE_PATH, "utf-8");
    const lines = csvData.trim().split("\n");

    if (lines.length === 0) return [];

    // First line is headers
    const headers = lines[0].split(",").map((h) => h.trim());

    // Parse each data line
    const complaints = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const complaint = {};
      headers.forEach((header, idx) => {
        const value = values[idx];
        // Parse numbers and dates
        if (header === "createdAt") {
          complaint[header] = parseInt(value);
        } else if (header === "speed") {
          complaint[header] = parseInt(value);
        } else {
          complaint[header] = value;
        }
      });
      return complaint;
    });

    return complaints;
  } catch (err) {
    if (err.code === "ENOENT") {
      // File doesn't exist, return empty array
      return [];
    }
    throw err;
  }
}

// Helper: Write array of objects to CSV file
async function _writeCSV(complaints) {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(CSV_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    if (complaints.length === 0) {
      await fs.writeFile(CSV_FILE_PATH, "");
      return;
    }

    // Generate headers from first object
    const headers = Object.keys(complaints[0]);
    const csvLines = [headers.join(",")];

    // Add data rows
    complaints.forEach((complaint) => {
      const values = headers.map((header) => {
        const value = complaint[header];
        // Escape commas in values
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`;
        }
        return value;
      });
      csvLines.push(values.join(","));
    });

    await fs.writeFile(CSV_FILE_PATH, csvLines.join("\n"));
  } catch (err) {
    logger.error("cannot write CSV", err);
    throw err;
  }
}

// Helper: Generate unique ID for CSV records
function _generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

async function queryCSV() {
  try {
    const complaints = await _readCSV();
    return complaints.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    logger.error("cannot find complaints from CSV", err);
    throw err;
  }
}

async function getByIdCSV(complaintId) {
  try {
    const complaints = await _readCSV();
    const complaint = complaints.find((c) => c._id === complaintId);

    if (!complaint) throw new Error("Complaint not found");

    return complaint;
  } catch (err) {
    logger.error(`while finding complaint ${complaintId} in CSV`, err);
    throw err;
  }
}

async function removeCSV(complaintId) {
  const { loggedinUser } = asyncLocalStorage.getStore();
  const { _id: ownerId, isAdmin } = loggedinUser;

  try {
    const complaints = await _readCSV();
    const complaintIndex = complaints.findIndex((c) => c._id === complaintId);

    if (complaintIndex === -1) throw new Error("Complaint not found");

    const complaint = complaints[complaintIndex];

    // Check permissions
    if (!isAdmin && complaint.owner?._id !== ownerId) {
      throw new Error("Not your complaint");
    }

    // Remove complaint
    complaints.splice(complaintIndex, 1);
    await _writeCSV(complaints);

    return complaintId;
  } catch (err) {
    logger.error(`cannot remove complaint ${complaintId} from CSV`, err);
    throw err;
  }
}

async function addCSV(complaint) {
  try {
    const complaints = await _readCSV();

    const newComplaint = {
      ...complaint,
      _id: _generateId(),
      createdAt: Date.now(),
    };

    complaints.push(newComplaint);
    await _writeCSV(complaints);

    return newComplaint;
  } catch (err) {
    logger.error("cannot insert complaint to CSV", err);
    throw err;
  }
}

async function updateCSV(complaint) {
  try {
    const complaints = await _readCSV();
    const complaintIndex = complaints.findIndex((c) => c._id === complaint._id);

    if (complaintIndex === -1) throw new Error("Complaint not found");

    // Update only specific fields
    complaints[complaintIndex] = {
      ...complaints[complaintIndex],
      vendor: complaint.vendor,
      speed: complaint.speed,
    };

    await _writeCSV(complaints);

    return complaints[complaintIndex];
  } catch (err) {
    logger.error(`cannot update complaint ${complaint._id} in CSV`, err);
    throw err;
  }
}
