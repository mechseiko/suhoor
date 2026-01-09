import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Users, TrendingUp, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc, setDoc, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore'
import StatsCard from '../components/StatsCard'
import DashboardLayout from '../layouts/DashboardLayout'



export default function Settings() {

    return (
        <DashboardLayout>
            <>Settings Page</>
        </DashboardLayout>
    )
}