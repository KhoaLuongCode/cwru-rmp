import { chromium } from 'playwright';
import { z } from 'zod';
import fs from 'fs';

// Define the Zod schema for course details
const courseSchema = z.object({
  courseCode: z.string().describe('The unique code for the course, e.g., CSDS 101'),
  title: z.string().describe('The title of the course'),
  units: z.string().describe('The number of units the course is worth'),
  description: z.string().describe('A detailed description of the course content'),
  prerequisites: z.string().optional().describe('Prerequisites for the course, if any'),
});

const schema = z.object({
  courses: z.array(courseSchema).describe('List of CSDS courses'),
});

(async () => {
  try {
    // Launch the browser
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    console.log('Navigating to the CSDS course descriptions page...');
    await page.goto('https://bulletin.case.edu/course-descriptions/astr/', { waitUntil: 'load', timeout: 60000 });
    console.log('Page loaded successfully.');

    // Wait for the main container that holds all courses to load
    await page.waitForSelector('.courseblock', { timeout: 30000 });
    console.log('Course descriptions are visible.');

    // Extract course data using accurate selectors
    const courses = await page.$$eval('.courseblock', (courseElements) => {
      return courseElements.map(course => {
        // Adjust selectors based on actual HTML structure
        const titleElement = course.querySelector('.courseblocktitle');
        const descElement = course.querySelector('.courseblockdesc');

        let courseCode = '';
        let title = '';
        let units = '';
        let description = '';
        let prerequisites = '';

        if (titleElement) {
          const titleText = titleElement.innerText.trim();

          // Use regex to extract course code, title, and units
          const titleMatch = titleText.match(/^([A-Z]+\s\d+)\.\s(.+?)\.\s([\d\-]+)\sUnits\./);
          if (titleMatch) {
            courseCode = titleMatch[1];
            title = titleMatch[2];
            units = titleMatch[3];
          }
        }

        if (descElement) {
          description = descElement.innerText.trim();

          // Extract prerequisites if they exist
          const prereqIndex = description.indexOf('Prereq:');
          if (prereqIndex !== -1) {
            prerequisites = description.substring(prereqIndex + 8).trim();
            description = description.substring(0, prereqIndex).trim();
          }
        }

        return { courseCode, title, units, description, prerequisites };
      });
    });

    // Validate the extracted data against the schema
    const validatedData = schema.parse({ courses });

    // Check if any courses were extracted
    if (validatedData.courses.length === 0) {
      console.warn('No courses were extracted. Please verify the selectors and page structure.');
    } else {
      console.log(`Extracted ${validatedData.courses.length} courses successfully.`);
    }

    // Output the extracted data to the console
    console.log(JSON.stringify(validatedData.courses, null, 2));

    // Save the data to a file named 'CSDS'
    fs.writeFileSync('Astro', JSON.stringify(validatedData.courses, null, 2));
    console.log('Course data saved to file named "Astro"');

    // Close the browser
    await browser.close();
    console.log('Browser closed.');
  } catch (error) {
    console.error('Error during scraping:', error);
  }
})();
