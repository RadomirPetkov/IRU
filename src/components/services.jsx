import React from "react";
import {
  ListItem,
  List,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemIcon,
  Link,
} from "@mui/material";
import { ArrowRight, ExpandMoreOutlined } from "@mui/icons-material";
import DoneIcon from "@mui/icons-material/Done";

export const Services = (props) => {
  return (
    <div id="services" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Отворени курсове:</h2>

          <p>
            Ние провеждаме безплатни и изцяло дистанционни курсове за цифрови
            компетентности, които се провеждат в делнични дни между 18:00 и
            21:00 ч. Обученията са предназначени за всички хора, които искат да
            подобрят своите дигитални умения – от работа с компютър и интернет
            до използване на офис приложения и защита на личните данни.
            Курсовете са практични и достъпни за всички, независимо от нивото на
            познания. Обучението се води от опитни специалисти и е съобразено с
            нуждите на съвременния дигитален свят. Повече информация за
            курсовете и как да кандидатствате може да откриете по-долу.
          </p>
          {props.data
            ? props.data.map((data) => (
                <Accordion style={{ marginTop: 50, borderRadius: 50 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreOutlined fontSize="large" />}
                  >
                    <h4 style={{ width: "100%" }}>{data.name}</h4>
                  </AccordionSummary>

                  <AccordionDetails>
                    <List>
                      <Accordion
                        style={{
                          background: "#f0faeb",
                          borderRadius: 80,
                          boxShadow: "0px 0px 4px 1.5px rgba(0,0,0,0.75)",
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreOutlined fontSize="large" />}
                        >
                          <h4 style={{ width: "100%" }}>Какво ще научите</h4>
                        </AccordionSummary>

                        <AccordionDetails>
                          {data.learning &&
                            data.learning.map((element) => (
                              <ListItem key={element}>
                                <ListItemIcon>
                                  <DoneIcon fontSize="large"></DoneIcon>
                                </ListItemIcon>
                                <ListItemText>
                                  <span style={{ fontSize: "17px" }}>
                                    {element}
                                  </span>
                                </ListItemText>
                              </ListItem>
                            ))}
                        </AccordionDetails>
                      </Accordion>

                      <Accordion
                        style={{
                          background: "#f0faeb",
                          borderRadius: 80,
                          boxShadow: "0px 0px 4px 1.5px rgba(0,0,0,0.75)",
                          margin: "10 0",
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreOutlined fontSize="large" />}
                        >
                          <h4 style={{ width: "100%" }}>
                            На какви условия трябва да отговаряте
                          </h4>
                        </AccordionSummary>

                        <AccordionDetails>
                          {data.conditions &&
                            data.conditions.map((element) => (
                              <ListItem key={element}>
                                <ListItemIcon>
                                  <DoneIcon fontSize="large"></DoneIcon>
                                </ListItemIcon>
                                <ListItemText>
                                  <span style={{ fontSize: "17px" }}>
                                    {element}
                                  </span>
                                </ListItemText>
                              </ListItem>
                            ))}
                        </AccordionDetails>
                      </Accordion>

                      <Accordion
                        style={{
                          background: "#f0faeb",
                          borderRadius: 80,
                          boxShadow: "0px 0px 4px 1.5px rgba(0,0,0,0.75)",
                          margin: "10 0",
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreOutlined fontSize="large" />}
                        >
                          <h4 style={{ width: "100%" }}>
                            Как да кандидатствате
                          </h4>
                        </AccordionSummary>

                        <AccordionDetails>
                          {data.signup &&
                            data.signup.map((element, i) => (
                              <ListItem key={element}>
                                <ListItemIcon>
                                  {i <= 1 ? (
                                    <DoneIcon fontSize="large"></DoneIcon>
                                  ) : (
                                    <ArrowRight fontSize="large"></ArrowRight>
                                  )}
                                </ListItemIcon>
                                <ListItemText>
                                  <span style={{ fontSize: "17px" }}>
                                    {i <= 1 ? (
                                      element
                                    ) : (
                                      <div>
                                        <span>
                                          <b>{element[0]}</b>
                                        </span>
                                        <span
                                          style={{
                                            textDecoration: "underline",
                                          }}
                                        >
                                          {element[1]}
                                        </span>
                                      </div>
                                    )}
                                    {i == 0 && (
                                      <Link
                                        style={{
                                          fontSize: "15px",
                                          marginLeft: 5,
                                        }}
                                      >
                                        <a
                                          href="https://serviceseprocess.az.government.bg/service/5aedf067-45f5-4a56-9fe7-ca42f9084cc8/description"
                                          target="_blank"
                                        >
                                          ТУК
                                        </a>
                                      </Link>
                                    )}
                                  </span>
                                </ListItemText>
                              </ListItem>
                            ))}
                        </AccordionDetails>
                      </Accordion>
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))
            : "loading"}
        </div>
        <div className="row">
          {/* {props.data
            ? props.data.map((d, i) => (
                <div key={`${d.name}-${i}`} className="col-md-4">
                  {" "}
                  <i className={d.icon}></i>
                  <div className="service-desc">
                    <h3>{d.name}</h3>
                    <p>{d.text}</p>
                  </div>
                </div>
              ))
            : "loading"} */}
        </div>
      </div>
    </div>
  );
};
