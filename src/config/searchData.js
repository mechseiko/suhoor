import { baseBooks } from "../pages/Books"
import { duas } from "../pages/Duas";
let bookTitles = [];
let duaTitles = [];
baseBooks.forEach(book => bookTitles.push(book.title))
duas.forEach(dua => duaTitles.push(dua.title))

export const searchData = [
    { page: 'Dashboard', queries: ['Dashboard', 'Activity', 'Statistics', 'Groups Created', 'My Activity', 'Total Groups', 'Total Members', 'Members', 'Fasting Streak', 'Fasting History'] },
    { page: 'Groups', queries: ['Groups', 'Join Group', 'Create Group', 'Group', 'Wake Up Tracker', 'Fasting Prompt', 'Alarm', 'Location Sharing'] },
    { page: 'Fasting', queries: ['Fasting', 'Fasting Times', 'Gregorian Date', 'Hijri Date', 'Suhoor', 'Iftar', 'Duration', 'Pro Tip'] },
    { page: 'Resources', queries: [...bookTitles, 'Library', 'Books', 'Resources'] },
    { page: 'Duas', queries: [...duaTitles, 'Adhkar', 'Duas', 'Duas & Adhkar'] },
    { page: 'Profile', queries: ['Password', 'Confirm Password', 'Account Information', 'Profile', 'Account', 'Email', 'Name', 'Security', 'Personal', 'Verify Email', 'Verification'] },
    { page: 'Settings', queries: ['Settings', 'Preferences', 'Notifications', 'Alarm Settings', 'Sound', 'Volume'] },
    { page: 'About', queries: ['About', 'Mission', 'Version', 'Team', 'Privacy', 'Terms'] },
]