
-- Insert Top Cybersecurity News Sites
INSERT INTO public.platforms (name, url, category, description) VALUES
('The Hacker News', 'https://thehackernews.com', 'Security Resource', 'Leading cybersecurity news and threat intelligence platform'),
('Dark Reading', 'https://www.darkreading.com', 'Security Resource', 'Cybersecurity news, analysis, and insights for IT professionals'),
('SecurityWeek', 'https://www.securityweek.com', 'Security Resource', 'Information security news, analysis, and research'),
('Krebs on Security', 'https://krebsonsecurity.com', 'Security Resource', 'In-depth security news and investigation by Brian Krebs'),
('CSO (IDG)', 'https://www.csoonline.com', 'Security Resource', 'Security news and analysis for chief security officers'),
('Infosecurity Magazine', 'https://www.infosecurity-magazine.com', 'Security Resource', 'Global information security magazine and news source'),
('Cybersecurity Dive', 'https://cybersecuritydive.com', 'Security Resource', 'Cybersecurity news and analysis for industry professionals'),
('CyberScoop', 'https://www.cyberscoop.com', 'Security Resource', 'Cybersecurity news covering government and private sector'),
('Threatpost', 'https://threatpost.com', 'Security Resource', 'Independent news site dedicated to information security');

-- Insert Additional Notable Resources
INSERT INTO public.platforms (name, url, category, description) VALUES
('Schneier on Security', 'https://www.schneier.com', 'Security Resource', 'Security technologist Bruce Schneier''s blog on security and technology'),
('Troy Hunt''s Blog', 'https://www.troyhunt.com', 'Security Resource', 'Security research and breach analysis by Troy Hunt'),
('Wired Security', 'https://www.wired.com/category/security', 'Security Resource', 'Technology and security news from Wired magazine'),
('Help Net Security', 'https://www.helpnetsecurity.com', 'Security Resource', 'Information security news, tools, and resources'),
('Cybercrime Magazine', 'https://www.cybercrimemagazine.com', 'Security Resource', 'Cybercrime prevention and cybersecurity awareness publication');

-- Insert Government and Industry Resources
INSERT INTO public.platforms (name, url, category, description) VALUES
('CISA Cyber Threats and Advisories', 'https://us-cert.cisa.gov/', 'Security Resource', 'US Cybersecurity and Infrastructure Security Agency threat advisories'),
('NIST Cybersecurity Framework', 'https://www.nist.gov/cyberframework', 'Security Resource', 'National Institute of Standards and Technology cybersecurity framework'),
('EU Cybersecurity Agency (ENISA)', 'https://www.enisa.europa.eu', 'Security Resource', 'European Union Agency for Cybersecurity'),
('CISA Official', 'https://www.cisa.gov/', 'Security Resource', 'Cybersecurity and Infrastructure Security Agency main portal');

-- Insert Podcasts
INSERT INTO public.platforms (name, url, category, description) VALUES
('Cybercrime Radio', 'https://cybercrimeradio.com', 'Security Resource', 'Cybersecurity podcast covering latest threats and trends'),
('Dark Reading Podcast', 'https://www.darkreading.com/podcast', 'Security Resource', 'Cybersecurity podcast from Dark Reading'),
('SecurityWeek Podcast', 'https://www.securityweek.com/podcast', 'Security Resource', 'Weekly cybersecurity podcast and discussions');

-- Insert Blogs and Newsletters
INSERT INTO public.platforms (name, url, category, description) VALUES
('Troy Hunt Newsletter', 'https://www.troyhunt.com/newsletter', 'Security Resource', 'Weekly cybersecurity newsletter by Troy Hunt'),
('Krebs on Security Newsletter', 'https://krebsonsecurity.com/newsletter', 'Security Resource', 'Security investigation newsletter by Brian Krebs'),
('Dark Reading Newsletter', 'https://www.darkreading.com/subscribe', 'Security Resource', 'Cybersecurity news and analysis newsletter');

-- Insert Security Tools and Databases
INSERT INTO public.platforms (name, url, category, description) VALUES
('Exploit Database', 'https://www.exploit-db.com/', 'Security Resource', 'Archive of public exploits and corresponding vulnerable software'),
('Metasploit', 'https://www.metasploit.com/', 'Security Resource', 'Penetration testing framework and exploit development platform'),
('Phrack Magazine', 'https://phrack.org/', 'Security Resource', 'Digital magazine focused on computer security and hacking'),
('OWASP', 'https://owasp.org/', 'Security Resource', 'Open Web Application Security Project - web application security'),
('NIST Computer Security Resource Center', 'https://csrc.nist.gov/', 'Security Resource', 'NIST computer security standards, guidelines, and research');
