/**
 * Features Logic - RHOMBUS Architecture
 * 
 * This module contains the business logic for features
 * Following RHOMBUS pattern:
 * - Pure business logic with no dependencies on external systems
 * - No knowledge of HTTP, presentation, or data sources
 */

export * from './features.js';
export { default as featuresLogic } from './features.js'; 