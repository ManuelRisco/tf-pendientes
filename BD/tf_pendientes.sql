-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 24, 2026 at 03:33 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tf_pendientes`
--

-- --------------------------------------------------------

--
-- Table structure for table `bitacora`
--

CREATE TABLE `bitacora` (
  `id` bigint(20) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `tipo_accion_id` int(11) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `registro_id` bigint(20) DEFAULT NULL,
  `detalles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalles`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bitacora`
--

INSERT INTO `bitacora` (`id`, `usuario_id`, `tipo_accion_id`, `modulo`, `registro_id`, `detalles`, `created_at`) VALUES
(3, NULL, 1, 'usuarios', 3, '{\"nuevo\": {\"email\": \"admin@tecnofilm.com\", \"rol_id\": 1}}', '2026-07-20 16:59:54'),
(4, NULL, 1, 'usuarios', 4, '{\"nuevo\": {\"email\": \"marcoengracio@tecnofilm.com\", \"rol_id\": 1}}', '2026-07-20 17:13:27'),
(5, NULL, 1, 'usuarios', 5, '{\"nuevo\": {\"email\": \"maricarmenvidalon@tecnofilm.com\", \"rol_id\": 1}}', '2026-07-20 17:15:10'),
(6, 3, 1, 'tareas', 2, '{\"nuevo\": {\"titulo\": \"Configurar camara\", \"estado_id\": 1, \"prioridad_id\": 3}}', '2026-07-20 17:17:19'),
(7, 3, 3, 'tareas', 2, '{\"anterior\": {\"titulo\": \"Configurar camara\", \"estado_id\": 1, \"prioridad_id\": 3, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"Configurar camara\", \"estado_id\": 1, \"prioridad_id\": 3, \"deleted_at\": \"2026-07-20 12:18:33\"}}', '2026-07-20 17:18:33'),
(8, NULL, 1, 'usuarios', 6, '{\"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2}}', '2026-07-20 17:28:02'),
(9, 3, 2, 'usuarios', 6, '{\"anterior\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}}', '2026-07-20 17:28:53'),
(10, 3, 1, 'tareas', 3, '{\"nuevo\": {\"titulo\": \"titulo prueba\", \"estado_id\": 1, \"prioridad_id\": 4}}', '2026-07-20 17:39:22'),
(11, 3, 1, 'tareas', 4, '{\"nuevo\": {\"titulo\": \"asas\", \"estado_id\": 1, \"prioridad_id\": 1}}', '2026-07-20 17:44:41'),
(12, 3, 2, 'tareas', 3, '{\"anterior\": {\"titulo\": \"titulo prueba\", \"estado_id\": 1, \"prioridad_id\": 4, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"titulo prueba\", \"estado_id\": 2, \"prioridad_id\": 4, \"deleted_at\": null}}', '2026-07-20 17:44:46'),
(13, 3, 2, 'tareas', 3, '{\"anterior\": {\"titulo\": \"titulo prueba\", \"estado_id\": 2, \"prioridad_id\": 4, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"titulo prueba\", \"estado_id\": 3, \"prioridad_id\": 4, \"deleted_at\": null}}', '2026-07-20 17:44:53'),
(14, 3, 2, 'tareas', 3, '{\"anterior\": {\"titulo\": \"titulo prueba\", \"estado_id\": 3, \"prioridad_id\": 4, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"titulo prueba\", \"estado_id\": 4, \"prioridad_id\": 4, \"deleted_at\": null}}', '2026-07-20 17:44:57'),
(15, 6, 2, 'tareas', 4, '{\"anterior\": {\"titulo\": \"asas\", \"estado_id\": 1, \"prioridad_id\": 1, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"asas\", \"estado_id\": 1, \"prioridad_id\": 2, \"deleted_at\": null}}', '2026-07-20 18:43:50'),
(16, 3, 3, 'usuarios', 6, '{\"anterior\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": \"2026-07-20 13:58:53\"}}', '2026-07-20 18:58:53'),
(17, 3, 4, 'usuarios', 6, '{\"anterior\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": \"2026-07-20 13:58:53\"}, \"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}}', '2026-07-20 19:03:23'),
(18, 3, 3, 'usuarios', 6, '{\"anterior\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": \"2026-07-20 14:03:34\"}}', '2026-07-20 19:03:34'),
(19, 3, 4, 'usuarios', 6, '{\"anterior\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": \"2026-07-20 14:03:34\"}, \"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}}', '2026-07-20 19:05:52'),
(20, 3, 3, 'usuarios', 6, '{\"anterior\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": \"2026-07-20 14:05:56\"}}', '2026-07-20 19:05:56'),
(21, 3, 4, 'usuarios', 6, '{\"anterior\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": \"2026-07-20 14:05:56\"}, \"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}}', '2026-07-20 19:06:06'),
(22, 3, 3, 'usuarios', 6, '{\"anterior\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": \"2026-07-20 14:06:09\"}}', '2026-07-20 19:06:09'),
(23, 3, 4, 'usuarios', 6, '{\"anterior\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": \"2026-07-20 14:06:09\"}, \"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}}', '2026-07-20 19:06:16'),
(24, 3, 2, 'usuarios', 6, '{\"anterior\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 1, \"deleted_at\": null}}', '2026-07-20 19:06:57'),
(25, 3, 2, 'usuarios', 6, '{\"anterior\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 1, \"deleted_at\": null}, \"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}}', '2026-07-20 19:07:38'),
(26, 3, 3, 'usuarios', 6, '{\"anterior\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": \"2026-07-20 14:07:41\"}}', '2026-07-20 19:07:41'),
(27, 3, 4, 'usuarios', 6, '{\"anterior\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": \"2026-07-20 14:07:41\"}, \"nuevo\": {\"email\": \"correoprueba@tecnofilm.com\", \"rol_id\": 2, \"deleted_at\": null}}', '2026-07-20 19:08:50'),
(28, 3, 3, 'tareas', 4, '{\"anterior\": {\"titulo\": \"asas\", \"estado_id\": 1, \"prioridad_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"asas\", \"estado_id\": 1, \"prioridad_id\": 2, \"deleted_at\": \"2026-07-20 14:16:46\"}}', '2026-07-20 19:16:46'),
(29, 3, 3, 'tareas', 3, '{\"anterior\": {\"titulo\": \"titulo prueba\", \"estado_id\": 4, \"prioridad_id\": 4, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"titulo prueba\", \"estado_id\": 4, \"prioridad_id\": 4, \"deleted_at\": \"2026-07-20 14:16:51\"}}', '2026-07-20 19:16:51'),
(30, 3, 1, 'tareas', 5, '{\"nuevo\": {\"titulo\": \"instalar camara\", \"estado_id\": 1, \"prioridad_id\": 1}}', '2026-07-20 19:17:29'),
(31, 3, 1, 'tareas', 6, '{\"nuevo\": {\"titulo\": \"configurar camara\", \"estado_id\": 1, \"prioridad_id\": 2}}', '2026-07-20 19:17:44'),
(32, 3, 1, 'tareas', 7, '{\"nuevo\": {\"titulo\": \"formatear laptop\", \"estado_id\": 1, \"prioridad_id\": 3}}', '2026-07-20 19:17:55'),
(33, 3, 1, 'tareas', 8, '{\"nuevo\": {\"titulo\": \"solucionar problema con el ERP\", \"estado_id\": 1, \"prioridad_id\": 4}}', '2026-07-20 19:18:11'),
(34, 3, 2, 'tareas', 6, '{\"anterior\": {\"titulo\": \"configurar camara\", \"estado_id\": 1, \"prioridad_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"configurar camara\", \"estado_id\": 3, \"prioridad_id\": 2, \"deleted_at\": null}}', '2026-07-20 19:18:20'),
(35, 3, 2, 'tareas', 7, '{\"anterior\": {\"titulo\": \"formatear laptop\", \"estado_id\": 1, \"prioridad_id\": 3, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"formatear laptop\", \"estado_id\": 2, \"prioridad_id\": 3, \"deleted_at\": null}}', '2026-07-20 19:18:29'),
(36, 3, 2, 'tareas', 5, '{\"anterior\": {\"titulo\": \"instalar camara\", \"estado_id\": 1, \"prioridad_id\": 1, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"instalar camara\", \"estado_id\": 4, \"prioridad_id\": 1, \"deleted_at\": null}}', '2026-07-20 19:18:34'),
(37, 3, 1, 'tareas', 9, '{\"nuevo\": {\"titulo\": \"instalar driver de impresoras\", \"estado_id\": 1, \"prioridad_id\": 2}}', '2026-07-20 19:19:12'),
(38, 3, 2, 'tareas', 9, '{\"anterior\": {\"titulo\": \"instalar driver de impresoras\", \"estado_id\": 1, \"prioridad_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"instalar driver de impresoras\", \"estado_id\": 3, \"prioridad_id\": 2, \"deleted_at\": null}}', '2026-07-20 19:19:18'),
(39, 3, 1, 'tareas', 10, '{\"nuevo\": {\"titulo\": \"prueba\", \"estado_id\": 1, \"prioridad_id\": 2}}', '2026-07-22 14:27:53'),
(40, 3, 1, 'tareas', 11, '{\"nuevo\": {\"titulo\": \"asa\", \"estado_id\": 1, \"prioridad_id\": 2}}', '2026-07-22 14:34:57'),
(41, 3, 2, 'tareas', 11, '{\"anterior\": {\"titulo\": \"asa\", \"estado_id\": 1, \"prioridad_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"asa\", \"estado_id\": 4, \"prioridad_id\": 2, \"deleted_at\": null}}', '2026-07-22 14:35:04'),
(42, 3, 3, 'tareas', 11, '{\"anterior\": {\"titulo\": \"asa\", \"estado_id\": 4, \"prioridad_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"asa\", \"estado_id\": 4, \"prioridad_id\": 2, \"deleted_at\": \"2026-07-22 09:35:27\"}}', '2026-07-22 14:35:27'),
(43, 3, 3, 'tareas', 10, '{\"anterior\": {\"titulo\": \"prueba\", \"estado_id\": 1, \"prioridad_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"prueba\", \"estado_id\": 1, \"prioridad_id\": 2, \"deleted_at\": \"2026-07-22 09:35:30\"}}', '2026-07-22 14:35:30'),
(44, 3, 1, 'tareas', 12, '{\"nuevo\": {\"titulo\": \"asasa\", \"estado_id\": 1, \"prioridad_id\": 4}}', '2026-07-22 14:40:04'),
(45, 3, 2, 'tareas', 12, '{\"anterior\": {\"titulo\": \"asasa\", \"estado_id\": 1, \"prioridad_id\": 4, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"asasa\", \"estado_id\": 2, \"prioridad_id\": 4, \"deleted_at\": null}}', '2026-07-22 14:40:12'),
(46, 3, 2, 'tareas', 12, '{\"anterior\": {\"titulo\": \"asasa\", \"estado_id\": 2, \"prioridad_id\": 4, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"asasa\", \"estado_id\": 2, \"prioridad_id\": 4, \"deleted_at\": null}}', '2026-07-22 14:40:22'),
(47, 3, 3, 'tareas', 12, '{\"anterior\": {\"titulo\": \"asasa\", \"estado_id\": 2, \"prioridad_id\": 4, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"asasa\", \"estado_id\": 2, \"prioridad_id\": 4, \"deleted_at\": \"2026-07-22 09:40:32\"}}', '2026-07-22 14:40:32'),
(48, NULL, 1, 'usuarios', 7, '{\"nuevo\": {\"email\": \"manuelfabrizzio.risco@gmail.com\", \"rol_id\": 1}}', '2026-07-22 14:41:14'),
(49, 3, 3, 'usuarios', 7, '{\"anterior\": {\"email\": \"manuelfabrizzio.risco@gmail.com\", \"rol_id\": 1, \"deleted_at\": null}, \"nuevo\": {\"email\": \"manuelfabrizzio.risco@gmail.com\", \"rol_id\": 1, \"deleted_at\": \"2026-07-22 09:43:50\"}}', '2026-07-22 14:43:50'),
(50, 3, 1, 'tareas', 13, '{\"nuevo\": {\"titulo\": \"tarea prueba\", \"estado_id\": 1, \"prioridad_id\": 2}}', '2026-07-22 14:49:22'),
(51, 3, 4, 'usuarios', 7, '{\"anterior\": {\"email\": \"manuelfabrizzio.risco@gmail.com\", \"rol_id\": 1, \"deleted_at\": \"2026-07-22 09:43:50\"}, \"nuevo\": {\"email\": \"manuelfabrizzio.risco@gmail.com\", \"rol_id\": 1, \"deleted_at\": null}}', '2026-07-22 14:49:49'),
(52, 3, 2, 'usuarios', 7, '{\"anterior\": {\"email\": \"manuelfabrizzio.risco@gmail.com\", \"rol_id\": 1, \"deleted_at\": null}, \"nuevo\": {\"email\": \"manuelfabrizzio.risco@gmail.com\", \"rol_id\": 2, \"deleted_at\": null}}', '2026-07-22 14:50:46'),
(53, 3, 2, 'usuarios', 7, '{\"anterior\": {\"email\": \"manuelfabrizzio.risco@gmail.com\", \"rol_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"email\": \"manuelfabrizzio.risco@gmail.com\", \"rol_id\": 1, \"deleted_at\": null}}', '2026-07-22 14:51:00'),
(54, 3, 2, 'tareas', 13, '{\"anterior\": {\"titulo\": \"tarea prueba\", \"estado_id\": 1, \"prioridad_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"tarea prueba\", \"estado_id\": 2, \"prioridad_id\": 2, \"deleted_at\": null}}', '2026-07-22 18:30:46'),
(55, 3, 2, 'tareas', 9, '{\"anterior\": {\"titulo\": \"instalar driver de impresoras\", \"estado_id\": 3, \"prioridad_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"instalar driver de impresoras\", \"estado_id\": 4, \"prioridad_id\": 2, \"deleted_at\": null}}', '2026-07-22 18:30:52'),
(56, 3, 2, 'tareas', 6, '{\"anterior\": {\"titulo\": \"configurar camara\", \"estado_id\": 3, \"prioridad_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"configurar camara\", \"estado_id\": 4, \"prioridad_id\": 2, \"deleted_at\": null}}', '2026-07-22 18:31:02'),
(57, 3, 2, 'tareas', 13, '{\"anterior\": {\"titulo\": \"tarea prueba\", \"estado_id\": 2, \"prioridad_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"tarea prueba\", \"estado_id\": 3, \"prioridad_id\": 2, \"deleted_at\": null}}', '2026-07-22 18:32:33'),
(58, 3, 2, 'tareas', 6, '{\"anterior\": {\"titulo\": \"configurar camara\", \"estado_id\": 4, \"prioridad_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"configurar camara\", \"estado_id\": 2, \"prioridad_id\": 2, \"deleted_at\": null}}', '2026-07-22 18:32:47'),
(59, 3, 2, 'tareas', 13, '{\"anterior\": {\"titulo\": \"tarea prueba\", \"estado_id\": 3, \"prioridad_id\": 2, \"deleted_at\": null}, \"nuevo\": {\"titulo\": \"tarea prueba\", \"estado_id\": 1, \"prioridad_id\": 2, \"deleted_at\": null}}', '2026-07-22 21:46:51'),
(60, 7, 2, 'usuarios', 7, '{\"anterior\": {\"email\": \"manuelfabrizzio.risco@gmail.com\", \"rol_id\": 1, \"deleted_at\": null}, \"nuevo\": {\"email\": \"manuelfabrizzio.risco@gmail.com\", \"rol_id\": 2, \"deleted_at\": null}}', '2026-07-22 22:27:42');

-- --------------------------------------------------------

--
-- Table structure for table `estados`
--

CREATE TABLE `estados` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estados`
--

INSERT INTO `estados` (`id`, `nombre`) VALUES
(2, 'En curso'),
(3, 'En revisión'),
(4, 'Finalizado'),
(1, 'Pendiente');

-- --------------------------------------------------------

--
-- Table structure for table `logs_acceso`
--

CREATE TABLE `logs_acceso` (
  `id` bigint(20) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `email_ingresado` varchar(150) NOT NULL,
  `direccion_ip` varchar(45) NOT NULL,
  `exitoso` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logs_acceso`
--

INSERT INTO `logs_acceso` (`id`, `usuario_id`, `email_ingresado`, `direccion_ip`, `exitoso`, `created_at`) VALUES
(15, 3, 'admin@tecnofilm.com', '::1', 1, '2026-07-20 17:12:17'),
(16, 3, 'admin@tecnofilm.com', '::1', 1, '2026-07-20 17:16:37'),
(17, 3, 'admin@tecnofilm.com', '::1', 1, '2026-07-20 17:16:52'),
(18, 3, 'admin@tecnofilm.com', '::1', 1, '2026-07-20 17:17:18'),
(19, 6, 'correoprueba@tecnofilm.com', '::1', 1, '2026-07-20 17:28:24'),
(20, 6, 'correoprueba@tecnofilm.com', '::1', 0, '2026-07-20 17:29:08'),
(21, 6, 'correoprueba@tecnofilm.com', '::1', 1, '2026-07-20 17:29:10'),
(22, 6, 'correoprueba@tecnofilm.com', '::1', 1, '2026-07-20 17:58:41'),
(23, 3, 'admin@tecnofilm.com', '::1', 1, '2026-07-20 17:58:49'),
(24, 6, 'correoprueba@tecnofilm.com', '::1', 0, '2026-07-20 19:01:29'),
(25, 6, 'correoprueba@tecnofilm.com', '::1', 1, '2026-07-20 19:03:27'),
(26, 6, 'correoprueba@tecnofilm.com', '::1', 0, '2026-07-20 19:05:50'),
(27, 6, 'correoprueba@tecnofilm.com', '::1', 1, '2026-07-20 19:05:54'),
(28, 6, 'correoprueba@tecnofilm.com', '::1', 1, '2026-07-20 19:06:07'),
(29, 6, 'correoprueba@tecnofilm.com', '::1', 1, '2026-07-20 19:06:17'),
(30, 6, 'correoprueba@tecnofilm.com', '::1', 0, '2026-07-20 19:08:34'),
(31, 6, 'correoprueba@tecnofilm.com', '::1', 0, '2026-07-20 19:08:41'),
(32, 6, 'correoprueba@tecnofilm.com', '::1', 0, '2026-07-20 19:08:41'),
(33, 6, 'correoprueba@tecnofilm.com', '::1', 0, '2026-07-20 19:08:44'),
(34, 6, 'correoprueba@tecnofilm.com', '::1', 1, '2026-07-20 19:08:52'),
(35, NULL, 'test@test.com', '::1', 0, '2026-07-22 14:03:11'),
(36, 3, 'admin@tecnofilm.com', '::1', 1, '2026-07-22 14:03:12'),
(37, 7, 'manuelfabrizzio.risco@gmail.com', '::1', 0, '2026-07-22 19:08:15'),
(38, 7, 'manuelfabrizzio.risco@gmail.com', '::1', 1, '2026-07-22 19:08:21'),
(39, 7, 'manuelfabrizzio.risco@gmail.com', '::1', 1, '2026-07-22 19:13:49'),
(40, 7, 'manuelfabrizzio.risco@gmail.com', '::1', 1, '2026-07-22 19:56:32'),
(41, 7, 'manuelfabrizzio.risco@gmail.com', '::1', 1, '2026-07-22 21:44:35'),
(42, 7, 'manuelfabrizzio.risco@gmail.com', '::1', 1, '2026-07-22 22:27:03'),
(43, 7, 'manuelfabrizzio.risco@gmail.com', '::1', 1, '2026-07-22 22:27:16'),
(44, 7, 'manuelfabrizzio.risco@gmail.com', '::1', 1, '2026-07-22 22:27:31'),
(45, 7, 'manuelfabrizzio.risco@gmail.com', '::1', 1, '2026-07-22 22:27:45'),
(46, 3, 'admin@tecnofilm.com', '::1', 1, '2026-07-22 22:29:41'),
(47, 7, 'manuelfabrizzio.risco@gmail.com', '::1', 1, '2026-07-22 22:30:00'),
(48, 3, 'admin@tecnofilm.com', '::1', 1, '2026-07-22 22:30:09'),
(49, 3, 'admin@tecnofilm.com', '::1', 1, '2026-07-24 13:25:40');

-- --------------------------------------------------------

--
-- Table structure for table `personas`
--

CREATE TABLE `personas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `personas`
--

INSERT INTO `personas` (`id`, `nombre`, `apellido`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 'Admin', 'Sistema', '2026-07-20 16:59:54', '2026-07-20 16:59:54', NULL),
(4, 'Marco', 'Engracio', '2026-07-20 17:13:27', '2026-07-20 17:13:27', NULL),
(5, 'Maricarmen', 'Vidalon', '2026-07-20 17:15:10', '2026-07-20 17:15:10', NULL),
(6, 'nombre prueba', 'apellido prueba', '2026-07-20 17:28:02', '2026-07-20 19:08:50', NULL),
(7, 'Manuel Fabrizzio', 'Risco Gil', '2026-07-22 14:41:14', '2026-07-22 14:49:49', NULL);

--
-- Triggers `personas`
--
DELIMITER $$
CREATE TRIGGER `trg_personas_after_update` AFTER UPDATE ON `personas` FOR EACH ROW BEGIN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        UPDATE usuarios SET deleted_at = NEW.deleted_at
        WHERE persona_id = NEW.id AND deleted_at IS NULL;
    ELSEIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
        UPDATE usuarios SET deleted_at = NULL
        WHERE persona_id = NEW.id AND deleted_at IS NOT NULL;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `prioridades`
--

CREATE TABLE `prioridades` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prioridades`
--

INSERT INTO `prioridades` (`id`, `nombre`) VALUES
(3, 'Alta'),
(1, 'Baja'),
(4, 'Critico'),
(2, 'Media');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `nombre`) VALUES
(1, 'Administrador'),
(2, 'Empleado');

-- --------------------------------------------------------

--
-- Table structure for table `tareas`
--

CREATE TABLE `tareas` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado_id` int(11) NOT NULL DEFAULT 1,
  `prioridad_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tareas`
--

INSERT INTO `tareas` (`id`, `titulo`, `descripcion`, `estado_id`, `prioridad_id`, `usuario_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, 'Configurar camara', 'Camara principal', 1, 3, 3, '2026-07-20 17:17:19', '2026-07-20 17:18:33', '2026-07-20 17:18:33'),
(3, 'titulo prueba', 'descripcion prueba', 4, 4, 3, '2026-07-20 17:39:22', '2026-07-20 19:16:51', '2026-07-20 19:16:51'),
(4, 'asas', 'asasa', 1, 2, 3, '2026-07-20 17:44:41', '2026-07-20 19:16:46', '2026-07-20 19:16:46'),
(5, 'instalar camara', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset\'s Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.', 4, 1, 3, '2026-07-20 19:17:29', '2026-07-20 19:18:34', NULL),
(6, 'configurar camara', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset\'s Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.', 2, 2, 3, '2026-07-20 19:17:44', '2026-07-22 18:32:47', NULL),
(7, 'formatear laptop', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset\'s Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.', 2, 3, 3, '2026-07-20 19:17:55', '2026-07-20 19:18:29', NULL),
(8, 'solucionar problema con el ERP', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset\'s Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.', 1, 4, 3, '2026-07-20 19:18:11', '2026-07-20 19:18:11', NULL),
(9, 'instalar driver de impresoras', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset\'s Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.', 4, 2, 3, '2026-07-20 19:19:12', '2026-07-22 18:30:52', NULL),
(10, 'prueba', 'prueba', 1, 2, 3, '2026-07-22 14:27:53', '2026-07-22 14:35:30', '2026-07-22 14:35:30'),
(11, 'asa', 'asas', 4, 2, 3, '2026-07-22 14:34:57', '2026-07-22 14:35:27', '2026-07-22 14:35:27'),
(12, 'asasa', 'asasaaa', 2, 4, 3, '2026-07-22 14:40:04', '2026-07-22 14:40:32', '2026-07-22 14:40:32'),
(13, 'tarea prueba', 'descripcion prueba', 1, 2, 3, '2026-07-22 14:49:22', '2026-07-22 21:46:51', NULL);

--
-- Triggers `tareas`
--
DELIMITER $$
CREATE TRIGGER `trg_tareas_after_insert` AFTER INSERT ON `tareas` FOR EACH ROW BEGIN
    DECLARE v_tipo_crear INT;
    SELECT id INTO v_tipo_crear FROM tipos_acciones WHERE nombre = 'CREAR' LIMIT 1;

    INSERT INTO bitacora (usuario_id, tipo_accion_id, modulo, registro_id, detalles)
    VALUES (
        @usuario_id_app,
        v_tipo_crear,
        'tareas',
        NEW.id,
        JSON_OBJECT(
            'nuevo', JSON_OBJECT('titulo', NEW.titulo, 'estado_id', NEW.estado_id, 'prioridad_id', NEW.prioridad_id)
        )
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_tareas_after_update` AFTER UPDATE ON `tareas` FOR EACH ROW BEGIN
    DECLARE v_tipo_accion_id INT;

    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        SELECT id INTO v_tipo_accion_id FROM tipos_acciones WHERE nombre = 'ELIMINAR_LOGICO' LIMIT 1;
    ELSEIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
        SELECT id INTO v_tipo_accion_id FROM tipos_acciones WHERE nombre = 'RESTAURAR' LIMIT 1;
    ELSE
        SELECT id INTO v_tipo_accion_id FROM tipos_acciones WHERE nombre = 'ACTUALIZAR' LIMIT 1;
    END IF;

    INSERT INTO bitacora (usuario_id, tipo_accion_id, modulo, registro_id, detalles)
    VALUES (
        @usuario_id_app,
        v_tipo_accion_id,
        'tareas',
        NEW.id,
        JSON_OBJECT(
            'anterior', JSON_OBJECT('titulo', OLD.titulo, 'estado_id', OLD.estado_id, 'prioridad_id', OLD.prioridad_id, 'deleted_at', OLD.deleted_at),
            'nuevo', JSON_OBJECT('titulo', NEW.titulo, 'estado_id', NEW.estado_id, 'prioridad_id', NEW.prioridad_id, 'deleted_at', NEW.deleted_at)
        )
    );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `tipos_acciones`
--

CREATE TABLE `tipos_acciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tipos_acciones`
--

INSERT INTO `tipos_acciones` (`id`, `nombre`) VALUES
(2, 'ACTUALIZAR'),
(1, 'CREAR'),
(3, 'ELIMINAR_LOGICO'),
(4, 'RESTAURAR');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `persona_id` int(11) NOT NULL,
  `rol_id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `persona_id`, `rol_id`, `email`, `password`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 3, 1, 'admin@tecnofilm.com', '$2y$10$3iQMF0gj7/hl/cERGO2uW.EiczwuoeTA4Uky8crq4BwV/Vo3xfdBK', '2026-07-20 16:59:54', '2026-07-20 16:59:54', NULL),
(4, 4, 1, 'marcoengracio@tecnofilm.com', '$2y$10$25e8548DdEpoI35BimBKYenXyCw30ljXd1Sky8iNa9yl3kNUZX5mW', '2026-07-20 17:13:27', '2026-07-20 17:13:27', NULL),
(5, 5, 1, 'maricarmenvidalon@tecnofilm.com', '$2y$10$kUNNsYhNj5H2xk3OllIhXetKFV/.cY3qL06eooOBkENoRNMSsHMqO', '2026-07-20 17:15:10', '2026-07-20 17:15:10', NULL),
(6, 6, 2, 'correoprueba@tecnofilm.com', '$2y$10$zu8M1aOhiznNvRZyTpvbcuSCTF.lsvjDtNGh8jQYDUozCRwoZ7mB6', '2026-07-20 17:28:02', '2026-07-20 19:08:50', NULL),
(7, 7, 2, 'manuelfabrizzio.risco@gmail.com', '$2y$10$uHdVVhkTVxsA21VjQanQVO67w4QUJ1Ys710egcLNGQjL/FvHXdp86', '2026-07-22 14:41:14', '2026-07-23 05:27:42', NULL);

--
-- Triggers `usuarios`
--
DELIMITER $$
CREATE TRIGGER `trg_usuarios_after_insert` AFTER INSERT ON `usuarios` FOR EACH ROW BEGIN
    DECLARE v_tipo_crear INT;
    SELECT id INTO v_tipo_crear FROM tipos_acciones WHERE nombre = 'CREAR' LIMIT 1;

    INSERT INTO bitacora (usuario_id, tipo_accion_id, modulo, registro_id, detalles)
    VALUES (
        @usuario_id_app,
        v_tipo_crear,
        'usuarios',
        NEW.id,
        JSON_OBJECT(
            'nuevo', JSON_OBJECT('email', NEW.email, 'rol_id', NEW.rol_id)
        )
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_usuarios_after_update` AFTER UPDATE ON `usuarios` FOR EACH ROW BEGIN
    DECLARE v_tipo_accion_id INT;

    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        SELECT id INTO v_tipo_accion_id FROM tipos_acciones WHERE nombre = 'ELIMINAR_LOGICO' LIMIT 1;
    ELSEIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
        SELECT id INTO v_tipo_accion_id FROM tipos_acciones WHERE nombre = 'RESTAURAR' LIMIT 1;
    ELSE
        SELECT id INTO v_tipo_accion_id FROM tipos_acciones WHERE nombre = 'ACTUALIZAR' LIMIT 1;
    END IF;

    INSERT INTO bitacora (usuario_id, tipo_accion_id, modulo, registro_id, detalles)
    VALUES (
        @usuario_id_app,
        v_tipo_accion_id,
        'usuarios',
        NEW.id,
        JSON_OBJECT(
            'anterior', JSON_OBJECT('email', OLD.email, 'rol_id', OLD.rol_id, 'deleted_at', OLD.deleted_at),
            'nuevo', JSON_OBJECT('email', NEW.email, 'rol_id', NEW.rol_id, 'deleted_at', NEW.deleted_at)
        )
    );
END
$$
DELIMITER ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bitacora`
--
ALTER TABLE `bitacora`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `tipo_accion_id` (`tipo_accion_id`);

--
-- Indexes for table `estados`
--
ALTER TABLE `estados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `logs_acceso`
--
ALTER TABLE `logs_acceso`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indexes for table `personas`
--
ALTER TABLE `personas`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `prioridades`
--
ALTER TABLE `prioridades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `tareas`
--
ALTER TABLE `tareas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `estado_id` (`estado_id`),
  ADD KEY `prioridad_id` (`prioridad_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indexes for table `tipos_acciones`
--
ALTER TABLE `tipos_acciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `persona_id` (`persona_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `rol_id` (`rol_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bitacora`
--
ALTER TABLE `bitacora`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `estados`
--
ALTER TABLE `estados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `logs_acceso`
--
ALTER TABLE `logs_acceso`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `personas`
--
ALTER TABLE `personas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `prioridades`
--
ALTER TABLE `prioridades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tareas`
--
ALTER TABLE `tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `tipos_acciones`
--
ALTER TABLE `tipos_acciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bitacora`
--
ALTER TABLE `bitacora`
  ADD CONSTRAINT `bitacora_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `bitacora_ibfk_2` FOREIGN KEY (`tipo_accion_id`) REFERENCES `tipos_acciones` (`id`);

--
-- Constraints for table `logs_acceso`
--
ALTER TABLE `logs_acceso`
  ADD CONSTRAINT `logs_acceso_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Constraints for table `tareas`
--
ALTER TABLE `tareas`
  ADD CONSTRAINT `tareas_ibfk_1` FOREIGN KEY (`estado_id`) REFERENCES `estados` (`id`),
  ADD CONSTRAINT `tareas_ibfk_2` FOREIGN KEY (`prioridad_id`) REFERENCES `prioridades` (`id`),
  ADD CONSTRAINT `tareas_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`),
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
