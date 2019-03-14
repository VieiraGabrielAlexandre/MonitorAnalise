-- calculates the uptime of the database in seconds
-- note: we're assuming that PMON startup time is the same as the database startup time
select 
   to_char(logon_time,'DD/MM/YYYY HH24:MI:SS')
from 
   v$session 
where 
   sid=1;
