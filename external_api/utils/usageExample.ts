import axios from "axios";
import { DetailedValidationError } from "../errors/DetailedValidationError";

// Example error handling usage
try {
    // API call example
} catch (error) {
    if (error instanceof DetailedValidationError) {
        console.error('Data from API does not match schema:', error.validationErrors);
    } else if (axios.isAxiosError(error)) {
        if (error.response) {
            console.error(`HTTP ${error.response.status}:`, error.response.data);
        } else if (error.request) {
            console.error('Network error:', error.message);
        }
    } else {
        console.error('Unexpected error:', error);
    }
}