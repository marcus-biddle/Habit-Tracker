import axios from 'axios';

const BASE_URL = 'https://group-tracker.onrender.com'
//'http://localhost:3000'
//'https://group-tracker.onrender.com'; // production

interface SheetScoreUpdatePayload {
  sheet: string;
  date: string;
  userName: string;
  score: number | null;
  operation: string
}

interface SheetScoreDeletePayload {
  sheet: string;
  date: string;
  userName: string;
  userData: Record<string, any>;
}

async function getHealthCheck() {
  const res = await axios.get(`${BASE_URL}/api/health`);
  return res.data;
}

async function getSheetData(sheetName: string) {
  const res = await axios.get(`${BASE_URL}/api/sheets/${sheetName}`);
  return res.data;
}

async function getUserList(sheetName: string) {
  const res = await axios.get(`${BASE_URL}/api/users/all/sheets/${sheetName}`);
  return res.data;
}

async function getUserStats(userName: string) {
  const res = await axios.get(`${BASE_URL}/api/users/${userName}`);
  return res.data;
}

async function updateScore(payload: SheetScoreUpdatePayload) {
  const res = await axios.post(`${BASE_URL}/api/scores/update`, payload);
  return res.data;
}

async function deleteScore(payload: SheetScoreDeletePayload) {
  const res = await axios.delete(`${BASE_URL}/api/scores/delete`, {
    data: payload,
  });
  return res.data;
}

export const GoogleSheetApi = {
    getSheetData,
    getUserList,
    updateScore,
    getUserStats
}