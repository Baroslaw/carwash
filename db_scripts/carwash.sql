-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Czas generowania: 25 Wrz 2017, 22:09
-- Wersja serwera: 10.1.9-MariaDB
-- Wersja PHP: 5.6.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `carwash`
--
CREATE DATABASE IF NOT EXISTS `carwash` DEFAULT CHARACTER SET utf8 COLLATE utf8_polish_ci;
USE `carwash`;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `cars`
--

CREATE TABLE `cars` (
  `id` bigint(20) NOT NULL,
  `reg_number` varchar(16) CHARACTER SET latin1 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `wash_history`
--

CREATE TABLE `wash_history` (
  `id` bigint(20) NOT NULL,
  `car_id` bigint(20) NOT NULL,
  `wash_type_id` bigint(20) NOT NULL,
  `wash_datetime` datetime NOT NULL,
  `person_id` bigint(20) NOT NULL,
  `used_with_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `wash_types`
--

CREATE TABLE `wash_types` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) COLLATE utf8_polish_ci NOT NULL,
  `order_number` int(11) NOT NULL,
  `description` text COLLATE utf8_polish_ci NOT NULL,
  `active` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

--
-- Indeksy dla zrzutów tabel
--

--
-- Indexes for table `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_reg_number` (`reg_number`);

--
-- Indexes for table `wash_history`
--
ALTER TABLE `wash_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `used_with_id_index` (`used_with_id`);

--
-- Indexes for table `wash_types`
--
ALTER TABLE `wash_types`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT dla tabeli `cars`
--
ALTER TABLE `cars`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;
--
-- AUTO_INCREMENT dla tabeli `wash_history`
--
ALTER TABLE `wash_history`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;
--
-- AUTO_INCREMENT dla tabeli `wash_types`
--
ALTER TABLE `wash_types`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
