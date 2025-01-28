import fetchApi from "./api";
import type { Activity } from "../types/Activity";

// Función para obtener todas las actividades
export const fetchActivities = async (): Promise<Activity[]> => {
  return await fetchApi("actividades/");
};

// Función para obtener una actividad por su ID
export const fetchActivityById = async (id: number): Promise<Activity> => {
  return await fetchApi(`actividades/${id}/`);
};