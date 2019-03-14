-- ermittelt die Uptime des DBMS in Sekunden
SELECT DATEDIFF ( ss, (SELECT crdate FROM master.dbo.sysdatabases WHERE NAME='tempdb'),GETDATE())