#!/usr/bin/env python3
"""
Valida un banco de ítems antes de dárselo a un alumno.

Los ítems se generan a mano o con un modelo, y los fallos que se cuelan no son
sutiles: una opción múltiple cuya respuesta no está entre las opciones, un
`ordenar` cuyas fichas no forman la frase, un `indiceError` que apunta a la
palabra equivocada. Todos hacen el ejercicio irresoluble, y el alumno pierde un
corazón por un fallo que no es suyo. Este script los caza en un segundo.

Uso:
    python scripts/validar_banco.py <ruta-app>/src/data/banco.json
    python scripts/validar_banco.py <banco.json> --unidades <unidades.json>

Salida: informe legible. Código 0 si no hay errores, 1 si los hay.
Los AVISOS no bloquean; los ERRORES sí.
"""

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

TIPOS = {
    "opcion_multiple", "completar", "ordenar", "transformar", "emparejar",
    "detectar_error", "sonido_ed", "linea_tiempo", "traducir", "escuchar",
}

COMUNES = ["id", "tipo", "unidad", "regla", "nivel", "explicacion"]

OBLIGATORIOS = {
    "opcion_multiple": ["enunciado", "opciones", "respuesta"],
    "completar":       ["enunciado", "respuesta"],
    "ordenar":         ["fichas", "respuesta"],
    "transformar":     ["enunciado", "transformacion", "respuesta"],
    "emparejar":       ["pares"],
    "detectar_error":  ["enunciado", "indiceError", "correccion"],
    "sonido_ed":       ["palabra", "respuesta"],
    "linea_tiempo":    ["enunciado", "respuesta"],
    "traducir":        ["enunciado", "respuesta"],
    "escuchar":        ["texto", "respuesta"],
}

FONEMAS = {"/ɪd/", "/t/", "/d/"}
TRANSFORMACIONES = {"negativa", "pregunta_yn", "pregunta_wh", "afirmativa"}


def normalizar(texto):
    """Misma normalización que motor/validar.js, para comprobar coherencia."""
    t = str(texto or "").lower()
    t = re.sub(r"[’‘ʼ´]", "'", t)
    t = re.sub(r"\s*([?!,;:])\s*", r"\1 ", t)
    t = re.sub(r"\s*\.\s*$", "", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def tokenizar(texto):
    """
    Trocea en fichas comparables, separando la puntuación pegada a la palabra.

    Hace falta porque las fichas pueden escribirse como ["yet", "."] o la
    respuesta como "... yet." — el motor las da por equivalentes, así que el
    validador tampoco debe protestar. El punto final se descarta (es opcional
    para el alumno); ? y ! sí cuentan, porque distinguir pregunta de afirmación
    es justo lo que mide el ejercicio.
    """
    tokens = []
    for palabra in str(texto or "").split():
        cuerpo, signos = re.match(r"^(.*?)([.?!,;:]*)$", palabra).groups()
        if cuerpo:
            tokens.append(cuerpo.lower())
        tokens.extend(signos)
    while tokens and tokens[-1] == ".":
        tokens.pop()
    return sorted(tokens)


def validar(banco, unidades=None):
    errores, avisos = [], []

    def err(i, msg):
        errores.append(f"[{i.get('id', '¿sin id?')}] {msg}")

    def avi(i, msg):
        avisos.append(f"[{i.get('id', '¿sin id?')}] {msg}")

    ids_unidad = set()
    ids_regla = set()
    if unidades:
        ids_unidad = {u["id"] for u in unidades.get("unidades", [])}
        ids_regla = set(unidades.get("reglas", {}).keys())

    # --- Unicidad de ids y de enunciados -------------------------------------
    contador_ids = Counter(i.get("id") for i in banco)
    for id_, n in contador_ids.items():
        if n > 1:
            errores.append(f"El id «{id_}» está repetido {n} veces.")

    vistos = {}
    for it in banco:
        clave = normalizar(it.get("enunciado") or it.get("texto") or it.get("palabra") or "")
        if not clave:
            continue
        if clave in vistos:
            avi(it, f"Enunciado repetido (ya está en {vistos[clave]}). El alumno lo notará en la segunda pasada.")
        else:
            vistos[clave] = it.get("id")

    # --- Ítem a ítem ---------------------------------------------------------
    for it in banco:
        tipo = it.get("tipo")

        if tipo not in TIPOS:
            err(it, f"Tipo desconocido: «{tipo}». Válidos: {', '.join(sorted(TIPOS))}.")
            continue

        for campo in COMUNES + OBLIGATORIOS[tipo]:
            if campo not in it or it[campo] in (None, "", []):
                err(it, f"Falta el campo obligatorio «{campo}».")

        if it.get("nivel") not in (1, 2, 3):
            err(it, f"nivel debe ser 1, 2 o 3 (es {it.get('nivel')!r}).")

        expl = str(it.get("explicacion", ""))
        if 0 < len(expl) < 25:
            avi(it, "La explicación es muy corta: es el único texto que el alumno lee con atención.")
        if expl.lower().startswith(("la respuesta es", "correcto", "incorrecto")) and len(expl) < 60:
            avi(it, "La explicación repite la respuesta en vez de explicar la regla.")

        if unidades:
            if it.get("unidad") not in ids_unidad:
                err(it, f"La unidad «{it.get('unidad')}» no existe en unidades.json.")
            if it.get("regla") and it["regla"] not in ids_regla:
                avi(it, f"La regla «{it['regla']}» no está en el diccionario de reglas: saldrá sin nombre en el perfil.")

        # Coherencia respuesta / aceptadas
        aceptadas = it.get("aceptadas")
        if aceptadas and it.get("respuesta"):
            if normalizar(it["respuesta"]) not in [normalizar(a) for a in aceptadas]:
                err(it, "«respuesta» no aparece en «aceptadas»; la respuesta modelo se daría por mala.")

        # --- Comprobaciones específicas de cada tipo -------------------------
        if tipo == "opcion_multiple":
            ops = it.get("opciones") or []
            if it.get("respuesta") not in ops:
                err(it, "«respuesta» no está entre las opciones: el ítem es irresoluble.")
            if len(ops) != len(set(ops)):
                err(it, "Hay opciones duplicadas.")
            if not 3 <= len(ops) <= 4:
                avi(it, f"{len(ops)} opciones: lo cómodo en móvil son 3 o 4.")
            if "___" not in str(it.get("enunciado", "")):
                avi(it, "El enunciado no tiene el marcador ___ del hueco.")

        elif tipo == "ordenar":
            fichas = it.get("fichas") or []
            de_fichas = tokenizar(" ".join(fichas))
            de_respuesta = tokenizar(it.get("respuesta", ""))
            if de_fichas != de_respuesta:
                err(it, "Las fichas no forman exactamente la respuesta: "
                        f"fichas={de_fichas} vs respuesta={de_respuesta}.")
            if len(fichas) < 4:
                avi(it, "Con menos de 4 fichas el ejercicio se resuelve solo.")

        elif tipo == "detectar_error":
            palabras = str(it.get("enunciado", "")).split()
            idx = it.get("indiceError")
            if not isinstance(idx, int) or not 0 <= idx < len(palabras):
                err(it, f"indiceError={idx!r} fuera de rango (la frase tiene {len(palabras)} palabras).")
            else:
                avi_txt = f"indiceError={idx} señala «{palabras[idx]}»"
                if it.get("correccion") and normalizar(palabras[idx]) == normalizar(it["correccion"]):
                    err(it, f"{avi_txt}, que ya es igual que la corrección: no hay error que encontrar.")

        elif tipo == "sonido_ed":
            if it.get("respuesta") not in FONEMAS:
                err(it, f"respuesta debe ser uno de {sorted(FONEMAS)} (es {it.get('respuesta')!r}).")
            if not str(it.get("palabra", "")).endswith("ed"):
                avi(it, "La palabra no acaba en -ed.")

        elif tipo == "linea_tiempo":
            zonas = it.get("zonas") or ["Pasado", "Ahora", "Futuro"]
            if it.get("respuesta") not in zonas:
                err(it, f"La respuesta «{it.get('respuesta')}» no está entre las zonas {zonas}.")

        elif tipo == "emparejar":
            pares = it.get("pares") or []
            if not 3 <= len(pares) <= 6:
                avi(it, f"{len(pares)} pares: lo razonable son entre 4 y 6.")
            derechas = [p.get("derecha") for p in pares]
            if len(derechas) != len(set(derechas)):
                err(it, "Hay valores repetidos en la columna derecha: el emparejamiento es ambiguo.")
            if any(not p.get("izquierda") or not p.get("derecha") for p in pares):
                err(it, "Algún par tiene un lado vacío.")

        elif tipo == "transformar":
            if it.get("transformacion") not in TRANSFORMACIONES:
                err(it, f"transformacion debe ser una de {sorted(TRANSFORMACIONES)}.")
            resp = str(it.get("respuesta", ""))
            if it.get("transformacion", "").startswith("pregunta") and not resp.rstrip().endswith("?"):
                err(it, "Es una transformación a pregunta pero la respuesta no acaba en «?».")
            if it.get("transformacion") == "negativa" and not it.get("aceptadas"):
                avi(it, "En negativas conviene aceptar la forma contraída y la completa (doesn't / does not).")

        elif tipo in ("completar", "traducir", "escuchar"):
            if tipo != "escuchar" and "___" not in str(it.get("enunciado", "")) and tipo == "completar":
                avi(it, "El enunciado de un «completar» debería llevar ___.")
            if tipo == "traducir" and it.get("fichas"):
                de_fichas = tokenizar(" ".join(it["fichas"]))
                de_respuesta = tokenizar(it.get("respuesta", ""))
                if de_fichas != de_respuesta:
                    err(it, f"Las fichas no forman la respuesta: {de_fichas} vs {de_respuesta}.")

    # --- Salud del banco en conjunto ----------------------------------------
    por_unidad = Counter(i.get("unidad") for i in banco)
    for unidad, n in sorted(por_unidad.items()):
        if n < 12:
            avisos.append(f"La unidad «{unidad}» solo tiene {n} ítems: con menos de 12 el repaso repite frases.")

    tipos = Counter(i.get("tipo") for i in banco)
    if len(banco):
        dominante, cuantos = tipos.most_common(1)[0]
        if cuantos / len(banco) > 0.45:
            avisos.append(f"El {round(cuantos / len(banco) * 100)}% del banco es «{dominante}». "
                          "Una lección monótona se abandona en la segunda sesión.")

    for unidad in por_unidad:
        de_la_unidad = [i for i in banco if i.get("unidad") == unidad]
        nivel3 = sum(1 for i in de_la_unidad if i.get("nivel") == 3)
        if de_la_unidad and nivel3 / len(de_la_unidad) < 0.15 and not unidad.startswith("orto"):
            avisos.append(f"La unidad «{unidad}» casi no tiene ítems de nivel 3 ({nivel3}/{len(de_la_unidad)}): "
                          "se queda en rellenar huecos y no llega a elegir entre tiempos.")

    return errores, avisos, {"total": len(banco), "unidades": por_unidad, "tipos": tipos}


def main():
    p = argparse.ArgumentParser(description="Valida el banco de ítems del entrenador de tiempos verbales.")
    p.add_argument("banco", help="Ruta a banco.json")
    p.add_argument("--unidades", help="Ruta a unidades.json (comprueba que unidad y regla existen)")
    args = p.parse_args()

    ruta = Path(args.banco)
    try:
        banco = json.loads(ruta.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"✗ {ruta} no es JSON válido: línea {e.lineno}, columna {e.colno} — {e.msg}")
        return 1
    if not isinstance(banco, list):
        print("✗ El banco debe ser una lista de ítems.")
        return 1

    unidades = None
    ruta_u = Path(args.unidades) if args.unidades else ruta.parent / "unidades.json"
    if ruta_u.exists():
        try:
            unidades = json.loads(ruta_u.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            print(f"⚠ {ruta_u} no es JSON válido; se omiten las comprobaciones de unidad y regla.\n")

    errores, avisos, resumen = validar(banco, unidades)

    print(f"Banco: {resumen['total']} ítems · {len(resumen['unidades'])} unidades")
    print("Tipos: " + ", ".join(f"{t} {n}" for t, n in resumen["tipos"].most_common()))
    print()

    if errores:
        print(f"✗ {len(errores)} ERROR(ES) — hay que corregirlos antes de publicar:")
        for e in errores:
            print(f"   • {e}")
        print()

    if avisos:
        print(f"⚠ {len(avisos)} aviso(s) — calidad mejorable:")
        for a in avisos:
            print(f"   • {a}")
        print()

    if not errores and not avisos:
        print("✓ Banco limpio.")
    elif not errores:
        print("✓ Sin errores bloqueantes.")

    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
