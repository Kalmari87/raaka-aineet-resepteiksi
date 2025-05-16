// pages/index.tsx
import { useState } from "react";
import reseptitData from "../public/reseptit.json";
import alkuperaisetAinekset from "../data/ainekset";
import Image from "next/image";
import bannerKuva from "../public/kuvitus.jpg";

interface Resepti {
  nimi: string;
  ainekset: string[];
  vaiheet: string[];
}

const alkuperaisetRajoitukset: { [key: string]: string[] } = {
  vegaani: ["maito", "juusto", "munat", "voi", "kana", "jauheliha"],
  kasvis: ["kana", "jauheliha"],
  gluteeniton: ["pasta", "leipä"],
  laktoositon: ["maito", "kerma", "juusto", "voi"],
  pähkinätön: ["pähkinät"]
};

const ruokavaliot = Object.keys(alkuperaisetRajoitukset);

export default function Home() {
  const [valitutAinekset, setValitutAinekset] = useState<string[]>([]);
  const [reseptit, setReseptit] = useState<Resepti[]>(reseptitData);
  const [aineksetLista, setAineksetLista] = useState<string[]>(alkuperaisetAinekset);
  const [rajoitukset, setRajoitukset] = useState<{ [key: string]: string[] }>({ ...alkuperaisetRajoitukset });
  const [uusiAines, setUusiAines] = useState<string>("");
  const [uusiNimi, setUusiNimi] = useState("");
  const [uudetAinekset, setUudetAinekset] = useState<string[]>([]);
  const [uudetVaiheet, setUudetVaiheet] = useState("");
  const [valitutRuokavaliot, setValitutRuokavaliot] = useState<string[]>([]);

  const toggleAines = (aines: string) => {
    setValitutAinekset((prev) =>
      prev.includes(aines) ? prev.filter((a) => a !== aines) : [...prev, aines]
    );
  };

  const toggleUusiAines = (aines: string) => {
    setUudetAinekset((prev) =>
      prev.includes(aines) ? prev.filter((a) => a !== aines) : [...prev, aines]
    );
  };

  const toggleRuokavalio = (tyyppi: string) => {
    setValitutRuokavaliot((prev) =>
      prev.includes(tyyppi) ? prev.filter((r) => r !== tyyppi) : [...prev, tyyppi]
    );
  };

  const lisaaResepti = () => {
    if (!uusiNimi || uudetAinekset.length === 0 || !uudetVaiheet.trim()) return;
    const uusi: Resepti = {
      nimi: uusiNimi,
      ainekset: uudetAinekset,
      vaiheet: uudetVaiheet.split("\n").filter((v) => v.trim() !== "")
    };
    setReseptit([uusi, ...reseptit]);
    setUusiNimi("");
    setUudetAinekset([]);
    setUudetVaiheet("");
  };

  const lisaaUusiAines = () => {
    const aines = uusiAines.trim().toLowerCase();
    if (!aines || aineksetLista.includes(aines)) return;

    // Kysy lisätäänkö se rajoituksiin (window.confirm)
    const paivitetytRajoitukset = { ...rajoitukset };
    ruokavaliot.forEach((tyyppi) => {
      const lisaa = window.confirm(`Lisätäänkö "${aines}" ruokavaliorajoitteeseen: ${tyyppi}?`);
      if (lisaa) {
        paivitetytRajoitukset[tyyppi] = [...(paivitetytRajoitukset[tyyppi] || []), aines];
      }
    });

    setAineksetLista([...aineksetLista, aines]);
    setRajoitukset(paivitetytRajoitukset);
    setUusiAines("");
  };

  const suodatetutReseptit = reseptit
    .filter((resepti) => {
      for (const rajoite of valitutRuokavaliot) {
        const kielletyt = rajoitukset[rajoite] || [];
        if (resepti.ainekset.some((aines) => kielletyt.includes(aines))) {
          return false;
        }
      }
      return true;
    })
    .map((resepti) => {
      const puuttuvat = resepti.ainekset.filter(
        (aines: string) => !valitutAinekset.includes(aines)
      );
      return { ...resepti, puuttuvat };
    })
    .sort((a, b) => a.puuttuvat.length - b.puuttuvat.length);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#eaf7ea', padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <Image src={bannerKuva} alt="Kuvitus" layout="responsive" />
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', color: '#2f7030' }}>Mitä sinulla on kotona?</h1>

      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Lisää uusi raaka-aine"
          value={uusiAines}
          onChange={(e) => setUusiAines(e.target.value)}
          style={{ flexGrow: 1, padding: '8px' }}
        />
        <button onClick={lisaaUusiAines} style={{ marginLeft: '10px', padding: '8px 12px' }}>Lisää</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', margin: '20px 0' }}>
        {aineksetLista.map((aines) => (
          <label key={aines} style={{ backgroundColor: 'white', padding: '8px', borderRadius: '8px', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}>
            <input
              type="checkbox"
              checked={valitutAinekset.includes(aines)}
              onChange={() => toggleAines(aines)}
              style={{ marginRight: '6px' }}
            />
            {aines}
          </label>
        ))}
      </div>

      {/* Rajoitukset ja reseptien lisäys säilyy entisellään */}
      {/* ... */}

    </div>
  );
}
