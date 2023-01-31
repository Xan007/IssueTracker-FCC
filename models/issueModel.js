const { Schema, model } = require("mongoose");

const issueSchema = new Schema({
    project_name: {
        type: String
    },
    issue_title: {
        type: String,
        required: true
    },
    status_text: {
        type: String
    },
    issue_text: {
        type: String,
        required: true
    },
    assigned_to: {
        type: String
    },
    open: {
        type: Boolean,
        default: true
    },
    created_by: {
        type: String,
        required: true
    },
    created_on: {
        type: String,
        default: () => {
            return new Date().toISOString()
        }
    },
    updated_on: {
        type: String,
        default: () => {
            return new Date().toISOString()
        }
    }
})

const Issue = model("Issue", issueSchema)

module.exports = Issue