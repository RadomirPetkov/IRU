import React from "react";
import { ListItem, List, ListItemText, Accordion, AccordionSummary, AccordionDetails, ListItemIcon } from "@mui/material";
import { ArrowRightRounded, ExpandMoreOutlined } from "@mui/icons-material";
import DoneIcon from '@mui/icons-material/Done';

export const Services = (props) => {
  return (
    <div id="services" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Отворени курсове:</h2>

          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti saepe maiores dolorem nobis doloribus quos ipsa sint voluptatum, illum perspiciatis iure placeat cupiditate nemo non eveniet atque magnam, odio, est expedita iusto rem id repellendus deserunt qui. Facere reiciendis vitae harum ipsum, repellat eaque earum dignissimos reprehenderit voluptatum impedit mollitia.
          </p>

          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti saepe maiores dolorem nobis doloribus quos ipsa sint voluptatum, illum perspiciatis iure placeat cupiditate nemo non eveniet atque magnam, odio, est expedita iusto rem id repellendus deserunt qui. Facere reiciendis vitae harum ipsum, repellat eaque earum dignissimos reprehenderit voluptatum impedit mollitia.
          </p>
          {props.data
            ? props.data.map((data) => (
              <Accordion style={{ marginTop: 10, borderRadius: 50 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreOutlined fontSize="large" />}
                >
                  <h4>{data.name}</h4>
                </AccordionSummary>

                <AccordionDetails>
                  <h3 style={{color: "black"}}>Какво ще научите</h3>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <DoneIcon fontSize="large"></DoneIcon>
                      </ListItemIcon>
                      <ListItemText>
                        Нови умения
                      </ListItemText>
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <DoneIcon fontSize="large"></DoneIcon>
                      </ListItemIcon>
                      <ListItemText>
                        Нови компетенции
                      </ListItemText>
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <DoneIcon fontSize="large"></DoneIcon>
                      </ListItemIcon>
                      <ListItemText>
                        Сертификат
                      </ListItemText>
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
            ))
            : 'loading'}

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
