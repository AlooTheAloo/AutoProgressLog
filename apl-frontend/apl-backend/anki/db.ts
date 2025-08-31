import dayjs, { Dayjs } from "dayjs";
import sqlite3, { Database } from "sqlite3";
import { ankiPath, getConfig, syncDataPath } from "../Helpers/getConfig";
import { RetentionMode } from "../types/options";
import { Logger } from "../Helpers/Log";

export async function getAnkiCardReviewCount(
  startTime: Dayjs,
  endTime: Dayjs = dayjs()
) {}

export async function getLastUpdate() {}

export async function DeleteAnkiData() {}

export async function getRetention(
  retentionMode: RetentionMode = "TRUE_RETENTION"
) {}

export async function getMatureCards() {}
