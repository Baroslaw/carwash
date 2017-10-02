-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Czas generowania: 25 Wrz 2017, 22:18
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

--
-- Zrzut danych tabeli `wash_types`
--

INSERT INTO `wash_types` (`id`, `name`, `order_number`, `description`, `active`) VALUES
(1, 'Płukanie', 1, 'Tylko popłuczyny', 1),
(2, 'Z szamponem', 2, 'Mycie z szamponem', 1),
(3, 'Szampon i wosk', 3, 'Lepsiejszy szampon i nieco woskowania.', 1),
(4, 'Szczotką drucianą', 1, 'Kiedyś się tak myło, ale to już jest nieaktywne.', 0),
(5, 'Mega full wypas', 4, 'Mega full wypasione mycie: szampon, wosk, lizanie błota z opon.', 1);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
