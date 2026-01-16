import { baseBooks } from "../pages/Books"
import { duas } from "../pages/Duas";
let bookTitles = [];
let duaTitles = [];
baseBooks.forEach(book => bookTitles.push(book.title))
duas.forEach(dua => duaTitles.push(dua.title))

export const searchData = [
    { page: 'Dashboard', queries: ['Dashboard', 'Activity', 'Statistics', 'Groups Created', 'My Activity', 'Total Groups', 'Total Members', 'Members', 'Fasting Streak', 'Fasting History', 'Milestones', 'Consistency', 'Yearly Goal', 'Spiritual Progress'] },
    { page: 'Groups', queries: ['Groups', 'Join Group', 'Create Group', 'Group', 'Wake Up Tracker', 'Fasting Prompt', 'Alarm', 'Location Sharing', 'Buzz', 'Member List'] },
    { page: 'Fasting', queries: ['Fasting', 'Fasting Times', 'Gregorian Date', 'Hijri Date', 'Suhoor', 'Iftar', 'Duration', 'Pro Tip', 'Timings'] },
    { page: 'Resources', queries: [...bookTitles, 'Library', 'Books', 'Resources', 'PDF', 'Reading'] },
    { page: 'Duas', queries: [...duaTitles, 'Adhkar', 'Duas', 'Duas & Adhkar', 'Supplications', 'Prayers'] },
    { page: 'Profile', queries: ['Password', 'Confirm Password', 'Account Information', 'Profile', 'Account', 'Email', 'Name', 'Security', 'Personal', 'Verify Email', 'Verification', 'Update Profile'] },
    { page: 'Settings', queries: ['Settings', 'Preferences', 'Notifications', 'Alarm Settings', 'Sound', 'Volume', 'Streak Notifications', 'Community Updates', 'Theme', 'App Info'] },
]